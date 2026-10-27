/**
 * Google Gemini AI Budget Planner Service
 * 
 * ARCHITECTURE NOTE:
 * In this client application, Gemini is called directly via `VITE_GEMINI_API_KEY` for development
 * and demonstration purposes. In a production environment, API keys should never be exposed in client bundles;
 * instead, a Firebase Cloud Function or serverless backend proxy should handle Gemini interactions.
 * 
 * SENSITIVE DATA POLICY:
 * This service NEVER receives or transmits sensitive guest data such as CNICs, passwords, or payment info.
 * All pricing math is computed deterministically from verified application data to prevent AI hallucinations.
 */

import { calculateNights } from '../utils/dateUtils';
import { calculateServiceCost } from '../firebase/serviceItemsService';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

/**
 * Deterministic helper to find best room & services matching budget
 */
export const calculateBudgetPackage = ({
  budget,
  guests,
  checkIn,
  checkOut,
  roomTypePreference,
  servicePreferences = [],
  availableRooms = [],
  availableServices = [],
}) => {
  const nights = calculateNights(checkIn, checkOut);
  const targetBudget = Number(budget) || 0;
  const guestCount = Number(guests) || 1;

  // 1. Filter rooms matching capacity
  let matchingRooms = availableRooms.filter(
    (r) => r.capacity >= guestCount && r.isActive !== false && r.category !== 'Meeting Rooms'
  );

  if (roomTypePreference && roomTypePreference !== 'Any') {
    const prefMatches = matchingRooms.filter(
      (r) => r.category.toLowerCase() === roomTypePreference.toLowerCase()
    );
    if (prefMatches.length > 0) {
      matchingRooms = prefMatches;
    }
  }

  // Sort by price ascending
  matchingRooms.sort((a, b) => a.pricePerNight - b.pricePerNight);

  if (matchingRooms.length === 0) {
    return {
      success: false,
      message: `No available rooms found for ${guestCount} guest(s). Please try adjusting your guest count or dates.`,
    };
  }

  // Pick best room fitting budget for total stay
  let selectedRoom = matchingRooms[0];
  for (const r of matchingRooms) {
    if (r.pricePerNight * nights <= targetBudget) {
      selectedRoom = r;
    }
  }

  const roomTotal = selectedRoom.pricePerNight * nights;
  let remainingBudget = targetBudget - roomTotal;

  // 2. Add requested services if budget allows or prioritize them
  const selectedServices = [];
  let servicesTotal = 0;

  for (const srv of availableServices) {
    if (servicePreferences.includes(srv.id) || servicePreferences.includes(srv.name)) {
      const cost = calculateServiceCost(srv, guestCount, nights);
      selectedServices.push({
        service: srv,
        cost,
      });
      servicesTotal += cost;
    }
  }

  const grandTotal = roomTotal + servicesTotal;
  const isWithinBudget = grandTotal <= targetBudget;
  const difference = Math.abs(targetBudget - grandTotal);

  return {
    success: true,
    selectedRoom,
    nights,
    guestCount,
    roomTotal,
    selectedServices,
    servicesTotal,
    grandTotal,
    targetBudget,
    isWithinBudget,
    difference,
  };
};

/**
 * Call Google Gemini API to generate personalized luxury stay recommendation
 */
export const generateAiBudgetPlan = async ({
  budget,
  guests,
  checkIn,
  checkOut,
  roomTypePreference,
  servicePreferences = [],
  availableRooms = [],
  availableServices = [],
  userNotes = '',
}) => {
  // Compute trusted base package
  const basePlan = calculateBudgetPackage({
    budget,
    guests,
    checkIn,
    checkOut,
    roomTypePreference,
    servicePreferences,
    availableRooms,
    availableServices,
  });

  if (!basePlan.success) {
    return basePlan;
  }

  const promptContext = {
    budgetPKR: basePlan.targetBudget,
    guests: basePlan.guestCount,
    nights: basePlan.nights,
    dates: `${checkIn} to ${checkOut}`,
    requestedRoomType: roomTypePreference || 'Any',
    userNotes,
    recommendedRoom: {
      name: basePlan.selectedRoom.name,
      category: basePlan.selectedRoom.category,
      pricePerNight: basePlan.selectedRoom.pricePerNight,
      capacity: basePlan.selectedRoom.capacity,
      amenities: basePlan.selectedRoom.amenities,
    },
    servicesIncluded: basePlan.selectedServices.map((s) => ({
      name: s.service.name,
      unitPrice: s.service.price,
      cost: s.cost,
    })),
    roomSubtotal: basePlan.roomTotal,
    servicesSubtotal: basePlan.servicesTotal,
    grandTotalPKR: basePlan.grandTotal,
    isWithinBudget: basePlan.isWithinBudget,
    differencePKR: basePlan.difference,
  };

  // If Gemini API key is provided, query Gemini model
  if (GEMINI_API_KEY && GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY') {
    try {
      const systemInstruction = `You are the chief AI Concierge at "Aurora Hotels & Bookings", a 5-star boutique luxury hotel brand.
Tone: Warm, welcoming, sophisticated, and attentive.
Instructions:
- Address the guest's stay requirements directly.
- Discuss the recommended room and why it suits their group of ${basePlan.guestCount} for ${basePlan.nights} night(s).
- Itemize why the selected services complement their stay.
- If their budget of Rs. ${basePlan.targetBudget.toLocaleString()} PKR ${basePlan.isWithinBudget ? 'comfortably covers' : 'is slightly below'} the total stay cost of Rs. ${basePlan.grandTotal.toLocaleString()} PKR, provide thoughtful guidance.
- Strict requirement: NEVER fabricate different prices, discounts, or room names. The trusted numbers have already been calculated.
- Structure your response with:
  1. A warm welcome & summary
  2. "The Aurora Experience Recommendation"
  3. "Budget Optimization & Value Highlights"
  4. Personalized hospitality tip for their stay.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: `${systemInstruction}\n\nSTAY PARAMETERS AND TRUSTED DATA:\n${JSON.stringify(promptContext, null, 2)}`,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 800,
            },
          }),
        }
      );

      if (response.ok) {
        const json = await response.json();
        const aiText = json?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (aiText) {
          return {
            ...basePlan,
            aiNarrative: aiText,
            isLiveAi: true,
          };
        }
      } else {
        console.warn('Gemini API returned error status:', response.status);
      }
    } catch (err) {
      console.warn('Gemini API call failed, using luxury concierge generator fallback:', err);
    }
  }

  // Graceful Concierge Narrative Generator (Runs when API key is missing or offline)
  const budgetStatusText = basePlan.isWithinBudget
    ? `Your stay comes within your budget with Rs. ${basePlan.difference.toLocaleString()} PKR to spare for on-site dining or relaxation.`
    : `Your stay total is Rs. ${basePlan.difference.toLocaleString()} PKR above your target budget, offering premium comfort and amenities.`;

  const fallbackNarrative = `### Welcome to Aurora Hotels & Bookings
We have carefully curated an ideal stay for **${basePlan.guestCount} guest${basePlan.guestCount > 1 ? 's' : ''}** for **${basePlan.nights} night${basePlan.nights > 1 ? 's' : ''}** (${checkIn} to ${checkOut}).

#### Recommended Stay: ${basePlan.selectedRoom.name}
The **${basePlan.selectedRoom.category}** provides the ideal balance of luxury, intimacy, and convenience. Enjoy amenities including ${basePlan.selectedRoom.amenities.slice(0, 4).join(', ')}, and acoustic soundproofing.

#### Selected Services & Enhancements
${
  basePlan.selectedServices.length > 0
    ? basePlan.selectedServices
        .map((s) => `• **${s.service.name}**: ${s.service.description || 'Added to elevate your comfort.'} (Rs. ${s.cost.toLocaleString()} PKR)`)
        .join('\n')
    : '• *No extra services selected yet. You may add breakfast buffet, high tea, or airport pickup anytime.*'
}

#### Budget Guidance
${budgetStatusText}
- **Room Subtotal (${basePlan.nights} night${basePlan.nights > 1 ? 's' : ''}):** Rs. ${basePlan.roomTotal.toLocaleString()} PKR
- **Selected Enhancements:** Rs. ${basePlan.servicesTotal.toLocaleString()} PKR
- **Total Estimated Investment:** **Rs. ${basePlan.grandTotal.toLocaleString()} PKR**

*Concierge Tip: You can review and customize your selections before confirming your reservation below.*`;

  return {
    ...basePlan,
    aiNarrative: fallbackNarrative,
    isLiveAi: false,
  };
};
