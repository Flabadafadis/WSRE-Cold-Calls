// ================================================
// SCRIPT CONTENT - All questions and sections
// ================================================

const scriptSections = [
  {
    id: 'intro',
    title: '👋 1. Opening & Verification',
    questions: [
      {
        key: 'intro_fields',
        type: 'fields',
        fields: [
          { label: 'Prospect name', key: 'prospect_name', placeholder: '[prospect]' },
          { label: 'Your name', key: 'your_name', placeholder: '[your name]' },
          { label: 'Street address', key: 'street_name', placeholder: '[street name]' }
        ]
      },
      {
        key: 'q1_answer',
        prompt: 'Hey, is this [prospect]?',
        responses: ['Yes, speaking', "Who's calling?", 'Not available', 'Wrong number', 'Do not call']
      },
      {
        key: 'q2_owner',
        prompt: "Cool! This is [name], I'm with WSRE — we're a local real estate company here in Southwest Florida. I was calling about your property over on [street name]. You're still the owner, right?",
        responses: ['Yes, I own it', 'Sold it', 'Family member', 'Tenant', 'Not interested', "What's this about?"]
      },
      {
        key: 'q3_time',
        prompt: "Awesome. Do you have a quick minute? I've got just a few questions — won't take long.",
        responses: ['Yes, go ahead', 'Make it quick', 'Call me back', 'Email me', 'Not interested']
      }
    ]
  },
  {
    id: 'motivation',
    title: '💭 2. Motivation & Current Situation',
    questions: [
      {
        key: 'q4_reason',
        prompt: "Perfect! So what's got you thinking about selling the place? Just curious what's going on.",
        responses: ['Moving/relocation', 'Inherited property', 'Tired of being landlord', 'Financial stress', 'Downsizing', 'Not thinking about it', 'Just exploring options', 'Other']
      },
      {
        key: 'q5_realtor',
        prompt: 'Got it. And are you working with a realtor right now, or just starting to think about next steps?',
        responses: ['Yes, have realtor', 'No realtor yet', 'Had one before', 'Prefer no realtor', 'FSBO']
      },
      {
        key: 'q6_previous',
        prompt: "(If they had property listed before:) What happened with that? Just didn't get the right offers, or...?",
        responses: ['Listed, no offers', 'Listed, low offers', 'Expired listing', 'Changed mind', 'N/A']
      }
    ]
  },
  {
    id: 'timeline',
    title: '⏱️ 3. Timeline & Urgency',
    questions: [
      {
        key: 'q7_timeline',
        prompt: "Cool. So are you hoping to sell pretty soon, or are you more in the 'just seeing what's out there' phase?",
        responses: ['ASAP', 'Within 30 days', '1-3 months', '3-6 months', 'Just exploring', 'No rush', 'Specific date'],
        field: { key: 'timeline_specific', placeholder: 'If specific date, enter here' }
      },
      {
        key: 'q8_ideal',
        prompt: 'Makes sense. And if everything lined up perfectly, when would be ideal for you?',
        responses: ['Tomorrow', 'This week', 'This month', 'Next few months', 'Flexible', 'Waiting for something']
      }
    ]
  },
  {
    id: 'property',
    title: '🏠 4. Property Details & Condition',
    questions: [
      {
        key: 'q9_occupancy',
        prompt: 'Okay, quick question — are you living in the property right now, or is it vacant or rented out?',
        responses: ['Owner-occupied', 'Vacant', 'Rented out', 'Family staying there', 'In transition']
      },
      {
        key: 'q10_condition',
        prompt: "And how's the condition? Does it need any work, or is it pretty move-in ready?",
        responses: ['Move-in ready', 'Good shape', 'Needs some work', 'Needs major work', 'Handyman special', 'Not sure']
      },
      {
        key: 'q11_repairs',
        prompt: 'Got it. Any big repairs on your radar — like roof, AC, foundation, stuff like that?',
        responses: ['None', 'Roof issues', 'AC/HVAC issues', 'Foundation issues', 'Plumbing issues', 'Electrical issues', 'Multiple issues', 'Cosmetic only']
      }
    ]
  },
  {
    id: 'financial',
    title: '💰 5. Financial Situation',
    questions: [
      {
        key: 'q12_mortgage',
        prompt: 'Cool, so... is there a mortgage on the place, or do you own it outright?',
        responses: ['Own outright', 'Small mortgage', 'Large mortgage', 'Behind on payments', 'Reverse mortgage', 'Prefer not to say']
      },
      {
        key: 'q13_taxes',
        prompt: "And everything's current with property taxes and stuff, or is there anything we should know about?",
        responses: ['All current', 'Taxes behind', 'HOA issues', 'Code violations', 'Liens', 'Multiple issues', 'Not sure']
      },
      {
        key: 'q14_value',
        prompt: 'Just ballpark, what do you think the place is worth these days?',
        responses: ['Under $100k', '$100k-$200k', '$200k-$300k', '$300k-$400k', '$400k+', 'No idea'],
        field: { key: 'value_specific', placeholder: 'Specific amount if provided' }
      }
    ]
  },
  {
    id: 'goals',
    title: '🎯 6. Goals & Motivations',
    questions: [
      {
        key: 'q15_goal',
        prompt: "So if you could sell this place on your terms, what would that allow you to do? Like, what's the bigger picture for you?",
        responses: ['Buy another home', 'Pay off debt', 'Cash out/invest', 'Relocate', 'Retire', 'Simplify life', 'Stop landlording', 'Other']
      },
      {
        key: 'q16_walkaway',
        prompt: 'That makes sense. And realistically, what would you need to walk away with to make this work for you?',
        responses: ['Full market value', 'Close to market', 'Break even', 'Just cover mortgage', 'Flexible', 'Needs to think'],
        field: { key: 'walkaway_amount', placeholder: 'Specific dollar amount if mentioned' }
      }
    ]
  },
  {
    id: 'decision',
    title: '👥 7. Decision Makers',
    questions: [
      {
        key: 'q17_decisionmaker',
        prompt: 'Cool, so are you the only one making the call here, or is there someone else you need to run stuff by?',
        responses: ['Just me', 'Spouse/partner', 'Family members', 'Business partner', 'Attorney/advisor', 'Multiple people']
      },
      {
        key: 'q18_availability',
        prompt: '(If others involved:) Would they be around if we came by to check out the property and chat about options?',
        responses: ['Yes, all present', 'Most present', 'Need to coordinate', 'Can decide alone', 'N/A']
      }
    ]
  },
  {
    id: 'appointment',
    title: '📅 8. Setting the Appointment',
    questions: [
      {
        key: 'q19_appointment',
        prompt: "Awesome, so here's the thing — we buy properties as-is, and we can usually close pretty quick if you're interested. Would you be cool with me swinging by this week just to take a look and run some numbers with you? No pressure, just want to see if we can help.",
        responses: ["Yes, let's do it", 'Maybe, tell me more', 'Email info first', 'Not ready', 'Not interested', 'Need to discuss']
      },
      {
        key: 'q20_when',
        prompt: 'Perfect! What works better for you — mornings or afternoons? And which day this week is best?',
        responses: ['Morning', 'Afternoon', 'Evening', 'Specific day', 'Flexible', 'Next week better'],
        fields: [
          { label: 'Day', key: 'appt_day', placeholder: 'e.g. Tuesday' },
          { label: 'Time', key: 'appt_time', type: 'time' }
        ]
      },
      {
        key: 'q21_confirm',
        prompt: "Great, I've got you down for [day/time]. I'll shoot you a text the day before to confirm — sound good?",
        responses: ['Confirmed', 'Yes, text me', 'Call instead', 'Email reminder', 'Tentative'],
        fields: [
          { label: 'Phone', key: 'contact_phone', placeholder: '(239) 555-1234' },
          { label: 'Email', key: 'contact_email', placeholder: 'email@example.com' }
        ]
      }
    ]
  },
  {
    id: 'close',
    title: '🤝 9. Closing the Call',
    questions: [
      {
        key: 'q22_additional',
        prompt: 'Awesome, I really appreciate you taking the time to chat with me today. Is there anything else I should know about the property or your situation before I come by?',
        responses: ['Nothing else', 'Mentioned something', 'Has questions', 'Wants more info']
      },
      {
        key: 'q23_goodbye',
        prompt: "Perfect! I'm looking forward to meeting you and checking out the place. See you [day/time] — have a great rest of your day!",
        responses: ['Friendly goodbye', 'Looking forward', 'Hung up', 'Awkward end']
      },
      {
        key: 'overall_notes',
        type: 'notes_only',
        prompt: '📝 Overall Call Notes & Talking Points',
        placeholder: 'Key takeaways, hot buttons, objections, personality notes, follow-up actions'
      }
    ]
  }
];

console.log('✅ Script content loaded:', scriptSections.length, 'sections');
