export type AlertLanguage = 'en' | 'hi' | 'gu' | 'mr';

export const ALERT_LANGUAGES: { id: AlertLanguage; label: string; native: string }[] = [
  { id: 'en', label: 'English', native: 'English' },
  { id: 'hi', label: 'Hindi', native: 'हिंदी' },
  { id: 'gu', label: 'Gujarati', native: 'ગુજરાતી' },
  { id: 'mr', label: 'Marathi', native: 'मराठी' },
];

export const ALERT_TRANSLATIONS: Record<
  AlertLanguage,
  {
    langPrompt: string;
    portalBadge: string;
    passBadge: string;
    pageTitle: string;
    pageSubtitle: string;
    sec1Title: string;
    verifiedPass: string;
    anonymousNotice: string;
    avgDelivery: string;
    sec2Title: string;
    oneTap: string;
    voiceNoteTitle: string;
    voiceActive: string;
    switchToVoice: string;
    tapToRecord: string;
    recording: string;
    stop: string;
    startRecording: string;
    audioReady: string;
    customNoteLabel: string;
    customNotePlaceholder: string;
    locationLabel: string;
    fetchingGps: string;
    gpsAttached: string;
    attachGps: string;
    locationPlaceholder: string;
    removeGps: string;
    sendButton: string;
    sendingButton: string;
    successTitle: string;
    successVoiceMsg: string;
    successTextMsg: string;
    successDesc: string;
    sendAnother: string;
    sec3Title: string;
    india24x7: string;
    sec3Desc: string;
    allInOne: string;
    dial112: string;
    tapToCall: string;
    promoBadge: string;
    freeForever: string;
    promoTitle: string;
    promoDesc: string;
    zeroSpam: string;
    driverPrivacy: string;
    printablePass: string;
    createFreeQr: string;
    footerPowered: string;
    footerTagline: string;
    connectingTitle: string;
    connectingSub: string;
    inactiveTitle: string;
    privacyAssuranceTitle: string;
    privacyAssuranceDesc: string;
    options: Record<string, { title: string; sub: string }>;
  }
> = {
  en: {
    langPrompt: 'Choose Language / भाषा चुनें',
    portalBadge: 'Smart Vehicle Alert Portal',
    passBadge: 'Safety QR Pass',
    pageTitle: 'Contact Vehicle Owner',
    pageSubtitle: "Send a polite, private notification directly to the driver's phone. No app required.",
    sec1Title: '1. Scanned Vehicle Details',
    verifiedPass: 'Verified Safety Pass',
    anonymousNotice: '100% Anonymous • Your phone number is never asked or shared',
    avgDelivery: 'Avg delivery: < 3s',
    sec2Title: '2. Select Parking Alert Reason',
    oneTap: '1-Tap Selection',
    voiceNoteTitle: 'Send Voice Note',
    voiceActive: 'Voice Mode Active',
    switchToVoice: '+ Switch to Voice',
    tapToRecord: 'Tap record to speak your message',
    recording: 'Recording',
    stop: 'Stop',
    startRecording: 'Start Recording',
    audioReady: 'Audio Ready',
    customNoteLabel: 'Optional Short Note for Driver:',
    customNotePlaceholder: 'e.g. Parked near basement pillar B-14, need to exit in 5 mins...',
    locationLabel: 'Optional Parking Spot / Landmark',
    fetchingGps: 'Fetching GPS...',
    gpsAttached: 'GPS Attached ✓',
    attachGps: '+ Attach GPS',
    locationPlaceholder: 'e.g. Basement 1 Pillar C-14, or Opposite Gate 2',
    removeGps: 'Remove',
    sendButton: 'Send Instant Alert to Owner',
    sendingButton: 'Delivering Instant Alert to Owner...',
    successTitle: 'Alert Delivered Successfully!',
    successVoiceMsg: 'Voice alert delivered privately to the vehicle owner!',
    successTextMsg: 'Parking alert delivered to the vehicle owner instantly!',
    successDesc:
      'The vehicle owner has received your instant private alert. Thank you for keeping parking responsible and safe!',
    sendAnother: 'Send Another Alert',
    sec3Title: '3. Urgent Emergency Helplines',
    india24x7: 'India 24x7',
    sec3Desc:
      'For accidents, crimes, medical distress or life-threatening situations, tap to dial national emergency services directly:',
    allInOne: 'All-in-One National Emergency',
    dial112: 'Dial 112 (Police • Ambulance • Fire)',
    tapToCall: 'Tap to Call',
    promoBadge: 'Own a Car or Bike in India?',
    freeForever: '100% Free Forever',
    promoTitle: 'Never leave your personal phone number on a car dashboard again.',
    promoDesc:
      'Paper slips expose your mobile number to strangers and spam. With ParkSignal, place a smart QR sticker on your windshield so anyone can notify you privately in 5 seconds.',
    zeroSpam: 'Zero Spam Calls',
    driverPrivacy: '100% Driver Privacy',
    printablePass: 'Printable Windshield Pass',
    createFreeQr: 'Create Your Free Vehicle QR Sticker',
    footerPowered: 'Powered by ParkSignal • Free Public Utility by BharatUtility',
    footerTagline: 'Your vehicle. Your privacy. Scan. Alert. Connect.',
    connectingTitle: 'Connecting to ParkSignal...',
    connectingSub: 'Checking vehicle status securely',
    inactiveTitle: 'Vehicle Alert Inactive',
    privacyAssuranceTitle: 'ParkSignal Privacy & Security Assurance',
    privacyAssuranceDesc: 'No vehicle owner contact information is disclosed through inactive or active QR codes.',
    options: {
      blocking: { title: 'Vehicle is Blocking', sub: 'Blocking my car, driveway or clear exit path' },
      move: { title: 'Please Move Vehicle', sub: 'Need parking spot or vehicle shifted slightly' },
      lights: { title: 'Headlights Left ON', sub: 'Car lights or parking lamps are draining battery' },
      window: { title: 'Window / Door Open', sub: 'Window rolled down or door ajar (theft / rain risk)' },
      damage: { title: 'Scratched / Flat Tyre', sub: 'Noticeable exterior damage, flat tyre or leakage' },
      emergency: { title: '🚨 Emergency Situation', sub: 'Urgent situation – owner attention required now' },
      child: { title: '👶 Child / Pet Inside', sub: 'Urgent safety alert – living being inside vehicle' },
      custom: { title: 'Custom Note / Other', sub: 'Type specific details or parking instructions' },
    },
  },
  hi: {
    langPrompt: 'भाषा चुनें / Choose Language',
    portalBadge: 'स्मार्ट वाहन अलर्ट पोर्टल',
    passBadge: 'सेफ्टी QR पास',
    pageTitle: 'वाहन मालिक से संपर्क करें',
    pageSubtitle: 'ड्राइवर के फोन पर सीधे विनम्र और निजी सूचना भेजें। किसी ऐप की ज़रूरत नहीं।',
    sec1Title: '1. स्कैन किए गए वाहन का विवरण',
    verifiedPass: 'सत्यापित सेफ्टी पास',
    anonymousNotice: '100% गोपनीय • आपका मोबाइल नंबर कभी नहीं पूछा या साझा किया जाता',
    avgDelivery: 'औसत डिलीवरी: < 3 सेकंड',
    sec2Title: '2. पार्किंग अलर्ट का कारण चुनें',
    oneTap: '1-टैप चयन',
    voiceNoteTitle: 'वॉइस नोट भेजें',
    voiceActive: 'वॉइस मोड चालू है',
    switchToVoice: '+ वॉइस पर स्विच करें',
    tapToRecord: 'अपना संदेश बोलने के लिए रिकॉर्ड दबाएं',
    recording: 'रिकॉर्डिंग जारी है',
    stop: 'रोकें',
    startRecording: 'रिकॉर्डिंग शुरू करें',
    audioReady: 'ऑडियो तैयार है',
    customNoteLabel: 'ड्राइवर के लिए छोटा संदेश (वैकल्पिक):',
    customNotePlaceholder: 'उदा. बेसमेंट पिलर B-14 के पास गाड़ी खड़ी है, 5 मिनट में निकलना है...',
    locationLabel: 'पार्किंग स्थान / लैंडमार्क (वैकल्पिक)',
    fetchingGps: 'GPS प्राप्त हो रहा है...',
    gpsAttached: 'GPS जुड़ा है ✓',
    attachGps: '+ GPS जोड़ें',
    locationPlaceholder: 'उदा. बेसमेंट 1 पिलर C-14, या गेट 2 के सामने',
    removeGps: 'हटाएं',
    sendButton: 'मालिक को तुरंत अलर्ट भेजें',
    sendingButton: 'मालिक को तुरंत अलर्ट भेजा जा रहा है...',
    successTitle: 'अलर्ट सफलतापूर्वक भेज दिया गया!',
    successVoiceMsg: 'वाहन मालिक को निजी तौर पर वॉइस अलर्ट भेज दिया गया है!',
    successTextMsg: 'वाहन मालिक को पार्किंग अलर्ट तुरंत भेज दिया गया है!',
    successDesc: 'वाहन मालिक को आपका तुरंत निजी अलर्ट मिल गया है। पार्किंग को सुरक्षित और ज़िम्मेदार बनाने के लिए धन्यवाद!',
    sendAnother: 'एक और अलर्ट भेजें',
    sec3Title: '3. आपातकालीन हेल्पलाइन नंबर',
    india24x7: 'भारत 24x7',
    sec3Desc: 'दुर्घटना, अपराध, मेडिकल इमरजेंसी या गंभीर स्थिति में राष्ट्रीय आपातकालीन सेवाओं को सीधे कॉल करें:',
    allInOne: 'ऑल-इन-वन राष्ट्रीय आपातकाल',
    dial112: '112 डायल करें (पुलिस • एम्बुलेंस • फायर)',
    tapToCall: 'कॉल करें',
    promoBadge: 'क्या आपके पास कार या बाइक है?',
    freeForever: 'हमेशा के लिए 100% मुफ़्त',
    promoTitle: 'अब कार डैशबोर्ड पर अपना पर्सनल मोबाइल नंबर कभी न छोड़ें।',
    promoDesc:
      'कागज की पर्ची पर नंबर लिखने से स्पैम और अनचाही कॉल आती हैं। ParkSignal का स्मार्ट QR स्टिकर लगाएं ताकि कोई भी आपको 5 सेकंड में निजी सूचना भेज सके।',
    zeroSpam: 'ज़ीरो स्पैम कॉल',
    driverPrivacy: '100% ड्राइवर प्राइवेसी',
    printablePass: 'प्रिंटेबल विंडशील्ड पास',
    createFreeQr: 'अपना मुफ़्त वाहन QR स्टिकर बनाएं',
    footerPowered: 'ParkSignal द्वारा संचालित • BharatUtility की मुफ़्त जन-सेवा',
    footerTagline: 'आपका वाहन। आपकी गोपनीयता। स्कैन करें। अलर्ट भेजें।',
    connectingTitle: 'ParkSignal से जुड़ रहा है...',
    connectingSub: 'वाहन की स्थिति सुरक्षित रूप से जांची जा रही है',
    inactiveTitle: 'वाहन अलर्ट निष्क्रिय है',
    privacyAssuranceTitle: 'ParkSignal गोपनीयता और सुरक्षा आश्वासन',
    privacyAssuranceDesc: 'सक्रिय या निष्क्रिय QR कोड के माध्यम से वाहन मालिक की कोई भी संपर्क जानकारी उजागर नहीं की जाती है।',
    options: {
      blocking: { title: 'गाड़ी रास्ता रोक रही है', sub: 'मेरी कार, ड्राइववे या बाहर निकलने का रास्ता रुका है' },
      move: { title: 'कृपया गाड़ी हटाएं', sub: 'पार्किंग की जगह चाहिए या गाड़ी थोड़ी आगे करें' },
      lights: { title: 'हेडलाइट्स चालू छूट गई हैं', sub: 'कार की लाइट्स चालू हैं, बैटरी डाउन हो सकती है' },
      window: { title: 'खिड़की / दरवाज़ा खुला है', sub: 'शीशा नीचे है या दरवाज़ा खुला है (चोरी / बारिश का खतरा)' },
      damage: { title: 'खरोंच / टायर पंक्चर', sub: 'गाड़ी में नुकसान, टायर पंक्चर या लीकेज दिखा है' },
      emergency: { title: '🚨 आपातकालीन स्थिति', sub: 'तुरंत ध्यान देने की आवश्यकता है – कृपया जल्दी आएं' },
      child: { title: '👶 अंदर बच्चा / पालतू जानवर है', sub: 'गंभीर सुरक्षा चेतावनी – गाड़ी के अंदर कोई जीवित है' },
      custom: { title: 'अन्य संदेश / कस्टम नोट', sub: 'अपनी बात या पार्किंग निर्देश लिखें' },
    },
  },
  gu: {
    langPrompt: 'ભાષા પસંદ કરો / Choose Language',
    portalBadge: 'સ્માર્ટ વાહન એલર્ટ પોર્ટલ',
    passBadge: 'સેફ્ટી QR પાસ',
    pageTitle: 'વાહન માલિકનો સંપર્ક કરો',
    pageSubtitle: 'ડ્રાઈવરના ફોન પર સીધો વિનમ્ર અને ખાનગી સંદેશ મોકલો. કોઈ એપની જરૂર નથી.',
    sec1Title: '1. સ્કેન કરેલ વાહનની વિગતો',
    verifiedPass: 'ચકાસાયેલ સેફ્ટી પાસ',
    anonymousNotice: '100% ખાનગી • તમારો ફોન નંબર ક્યારેય પૂછવામાં કે શેર કરવામાં આવતો નથી',
    avgDelivery: 'સરેરાશ ડિલિવરી: < 3 સેકન્ડ',
    sec2Title: '2. પાર્કિંગ એલર્ટનું કારણ પસંદ કરો',
    oneTap: '1-ટેપ પસંદગી',
    voiceNoteTitle: 'વોઈસ નોટ મોકલો',
    voiceActive: 'વોઈસ મોડ ચાલુ છે',
    switchToVoice: '+ વોઈસ પર સ્વિચ કરો',
    tapToRecord: 'તમારો સંદેશ બોલવા માટે રેકોર્ડ દબાવો',
    recording: 'રેકોર્ડિંગ ચાલુ છે',
    stop: 'રોકો',
    startRecording: 'રેકોર્ડિંગ શરૂ કરો',
    audioReady: 'ઓડિયો તૈયાર છે',
    customNoteLabel: 'ડ્રાઈવર માટે ટૂંકી નોંધ (વૈકલ્પિક):',
    customNotePlaceholder: 'દા.ત. બેઝમેન્ટ પિલર B-14 પાસે ગાડી છે, 5 મિનિટમાં નીકળવું છે...',
    locationLabel: 'પાર્કિંગ સ્થળ / લેન્ડમાર્ક (વૈકલ્પિક)',
    fetchingGps: 'GPS મેળવી રહ્યું છે...',
    gpsAttached: 'GPS જોડાયેલ છે ✓',
    attachGps: '+ GPS જોડો',
    locationPlaceholder: 'દા.ત. બેઝમેન્ટ 1 પિલર C-14, અથવા ગેટ 2 સામે',
    removeGps: 'દૂર કરો',
    sendButton: 'માલિકને તરત એલર્ટ મોકલો',
    sendingButton: 'માલિકને તરત એલર્ટ મોકલાઈ રહ્યું છે...',
    successTitle: 'એલર્ટ સફળતાપૂર્વક મોકલાઈ ગયું!',
    successVoiceMsg: 'વાહન માલિકને ખાનગી રીતે વોઈસ એલર્ટ મોકલવામાં આવ્યું છે!',
    successTextMsg: 'વાહન માલિકને પાર્કિંગ એલર્ટ તરત જ મોકલવામાં આવ્યું છે!',
    successDesc: 'વાહન માલિકને તમારું તાત્કાલિક ખાનગી એલર્ટ મળી ગયું છે. સુરક્ષિત પાર્કિંગ માટે આભાર!',
    sendAnother: 'બીજું એલર્ટ મોકલો',
    sec3Title: '3. તાત્કાલિક હેલ્પલાઈન નંબરો',
    india24x7: 'ભારત 24x7',
    sec3Desc: 'અકસ્માત, ગુના, મેડિકલ ઈમરજન્સી કે ગંભીર પરિસ્થિતિમાં રાષ્ટ્રીય કટોકટી સેવાઓને સીધો કોલ કરો:',
    allInOne: 'ઓલ-ઈન-વન રાષ્ટ્રીય કટોકટી',
    dial112: '112 ડાયલ કરો (પોલીસ • એમ્બ્યુલન્સ • ફાયર)',
    tapToCall: 'કોલ કરો',
    promoBadge: 'શું તમારી પાસે કાર કે બાઈક છે?',
    freeForever: 'હંમેશા માટે 100% મફત',
    promoTitle: 'હવે કારના ડેશબોર્ડ પર તમારો પર્સનલ મોબાઈલ નંબર ક્યારેય ન મૂકો.',
    promoDesc:
      'કાગળની ચિઠ્ઠી પર નંબર લખવાથી સ્પામ અને અજાણ્યા કોલ્સ આવે છે. ParkSignal નું સ્માર્ટ QR સ્ટીકર લગાવો જેથી કોઈ પણ તમને 5 સેકન્ડમાં ખાનગી જાણ કરી શકે.',
    zeroSpam: 'ઝીરો સ્પામ કોલ્સ',
    driverPrivacy: '100% ડ્રાઈવર પ્રાઈવસી',
    printablePass: 'પ્રિન્ટેબલ વિન્ડશિલ્ડ પાસ',
    createFreeQr: 'તમારું મફત વાહન QR સ્ટીકર બનાવો',
    footerPowered: 'ParkSignal દ્વારા સંચાલિત • BharatUtility ની મફત જાહેર સેવા',
    footerTagline: 'તમારું વાહન. તમારી ગોપનીયતા. સ્કેન કરો. એલર્ટ મોકલો.',
    connectingTitle: 'ParkSignal સાથે જોડાઈ રહ્યું છે...',
    connectingSub: 'વાહનની સ્થિતિ સુરક્ષિત રીતે તપાસવામાં આવી રહી છે',
    inactiveTitle: 'વાહન એલર્ટ નિષ્ક્રિય છે',
    privacyAssuranceTitle: 'ParkSignal ગોપનીયતા અને સુરક્ષા ખાતરી',
    privacyAssuranceDesc: 'સક્રિય કે નિષ્ક્રિય QR કોડ દ્વારા વાહન માલિકની કોઈપણ સંપર્ક માહિતી જાહેર કરવામાં આવતી નથી.',
    options: {
      blocking: { title: 'વાહન રસ્તો રોકે છે', sub: 'મારી કાર, ડ્રાઈવવે કે બહાર નીકળવાનો રસ્તો રોકાયેલ છે' },
      move: { title: 'કૃપા કરીને વાહન હટાવો', sub: 'પાર્કિંગ જગ્યા જોઈએ છે અથવા વાહન થોડું ખસેડો' },
      lights: { title: 'હેડલાઈટ્સ ચાલુ રહી ગઈ છે', sub: 'કારની લાઈટ ચાલુ છે, બેટરી ઉતરી શકે છે' },
      window: { title: 'બારી / દરવાજો ખુલ્લો છે', sub: 'કાચ નીચે છે અથવા દરવાજો ખુલ્લો છે (ચોરી / વરસાદનું જોખમ)' },
      damage: { title: 'સ્ક્રેચ / ટાયર પંચર', sub: 'વાહનને નુકસાન, ટાયર પંચર કે લીકેજ જણાય છે' },
      emergency: { title: '🚨 કટોકટીની પરિસ્થિતિ', sub: 'તાત્કાલિક ધ્યાન આપવાની જરૂર છે – કૃપા કરીને જલ્દી આવો' },
      child: { title: '👶 અંદર બાળક / પાલતુ પ્રાણી છે', sub: 'ગંભીર સુરક્ષા ચેતવણી – વાહનની અંદર કોઈ જીવિત છે' },
      custom: { title: 'અન્ય સંદેશ / કસ્ટમ નોંધ', sub: 'ચોક્કસ વિગતો અથવા પાર્કિંગ સૂચના લખો' },
    },
  },
  mr: {
    langPrompt: 'भाषा निवडा / Choose Language',
    portalBadge: 'स्मार्ट वाहन अलर्ट पोर्टल',
    passBadge: 'सेफ्टी QR पास',
    pageTitle: 'वाहन मालकाशी संपर्क साधा',
    pageSubtitle: 'चालकाच्या फोनवर थेट नम्र आणि खाजगी सूचना पाठवा. कोणत्याही ॲपची गरज नाही.',
    sec1Title: '1. स्कॅन केलेल्या वाहनाचा तपशील',
    verifiedPass: 'पडताळलेला सेफ्टी पास',
    anonymousNotice: '100% गोपनीय • तुमचा फोन नंबर कधीही विचारला किंवा शेअर केला जात नाही',
    avgDelivery: 'सरासरी डिलिव्हरी: < 3 सेकंद',
    sec2Title: '2. पार्किंग अलर्टचे कारण निवडा',
    oneTap: '1-टॅप निवड',
    voiceNoteTitle: 'व्हॉइस नोट पाठवा',
    voiceActive: 'व्हॉइस मोड सक्रिय आहे',
    switchToVoice: '+ व्हॉइसवर स्विच करा',
    tapToRecord: 'तुमचा संदेश बोलण्यासाठी रेकॉर्ड दाबा',
    recording: 'रेकॉर्डिंग सुरू आहे',
    stop: 'थांबवा',
    startRecording: 'रेकॉर्डिंग सुरू करा',
    audioReady: 'ऑडिओ तयार आहे',
    customNoteLabel: 'चालकासाठी छोटी टीप (ऐच्छिक):',
    customNotePlaceholder: 'उदा. बेसमेंट पिलर B-14 जवळ गाडी उभी आहे, 5 मिनिटांत बाहेर पडायचे आहे...',
    locationLabel: 'पार्किंगचे ठिकाण / खूण (ऐच्छिक)',
    fetchingGps: 'GPS मिळवत आहे...',
    gpsAttached: 'GPS जोडले आहे ✓',
    attachGps: '+ GPS जोडा',
    locationPlaceholder: 'उदा. बेसमेंट 1 पिलर C-14, किंवा गेट 2 समोर',
    removeGps: 'काढा',
    sendButton: 'मालकाला त्वरित अलर्ट पाठवा',
    sendingButton: 'मालकाला त्वरित अलर्ट पाठवला जात आहे...',
    successTitle: 'अलर्ट यशस्वीरित्या पाठवला!',
    successVoiceMsg: 'वाहन मालकाला खाजगीरित्या व्हॉइस अलर्ट पाठवला आहे!',
    successTextMsg: 'वाहन मालकाला पार्किंग अलर्ट त्वरित पाठवला आहे!',
    successDesc: 'वाहन मालकाला तुमचा त्वरित खाजगी अलर्ट मिळाला आहे. सुरक्षित पार्किंगसाठी धन्यवाद!',
    sendAnother: 'दुसरा अलर्ट पाठवा',
    sec3Title: '3. तातडीचे हेल्पलाइन नंबर',
    india24x7: 'भारत 24x7',
    sec3Desc: 'अपघात, गुन्हे, वैद्यकीय आणीबाणी किंवा गंभीर परिस्थितीत राष्ट्रीय आपत्कालीन सेवांना थेट कॉल करा:',
    allInOne: 'ऑल-इन-वन राष्ट्रीय आणीबाणी',
    dial112: '112 डायल करा (पोलीस • रुग्णवाहिका • अग्निशमन)',
    tapToCall: 'कॉल करा',
    promoBadge: 'तुमच्याकडे कार किंवा बाईक आहे का?',
    freeForever: 'कायमचे 100% मोफत',
    promoTitle: 'आता कारच्या डॅशबोर्डवर तुमचा वैयक्तिक फोन नंबर कधीही ठेवू नका.',
    promoDesc:
      'कागदाच्या चिठ्ठीवर नंबर लिहिल्याने स्पॅम आणि त्रासदायक कॉल्स येतात. ParkSignal चे स्मार्ट QR स्टिकर लावा जेणेकरून कोणीही तुम्हाला 5 सेकंदात खाजगी सूचना देऊ शकेल.',
    zeroSpam: 'झिरो स्पॅम कॉल्स',
    driverPrivacy: '100% चालक गोपनीयता',
    printablePass: 'प्रिंटेबल विंडशील्ड पास',
    createFreeQr: 'तुमचे मोफत वाहन QR स्टिकर बनवा',
    footerPowered: 'ParkSignal द्वारे समर्थित • BharatUtility ची मोफत सार्वजनिक सेवा',
    footerTagline: 'तुमचे वाहन. तुमची गोपनीयता. स्कॅन करा. अलर्ट पाठवा.',
    connectingTitle: 'ParkSignal शी कनेक्ट होत आहे...',
    connectingSub: 'वाहनाची स्थिती सुरक्षितपणे तपासत आहे',
    inactiveTitle: 'वाहन अलर्ट निष्क्रिय आहे',
    privacyAssuranceTitle: 'ParkSignal गोपनीयता आणि सुरक्षा हमी',
    privacyAssuranceDesc: 'सक्रिय किंवा निष्क्रिय QR कोडद्वारे वाहन मालकाची कोणतीही संपर्क माहिती उघड केली जात नाही.',
    options: {
      blocking: { title: 'वाहन रस्ता अडवत आहे', sub: 'माझी कार, ड्राइव्हवे किंवा बाहेर पडण्याचा मार्ग अडवला आहे' },
      move: { title: 'कृपया वाहन बाजूला घ्या', sub: 'पार्किंगची जागा हवी आहे किंवा वाहन थोडे सरकवा' },
      lights: { title: 'हेडलाइट्स सुरूच आहेत', sub: 'गाडीचे दिवे सुरू आहेत, बॅटरी उतरू शकते' },
      window: { title: 'खिडकी / दरवाजा उघडा आहे', sub: 'काच खाली आहे किंवा दरवाजा उघडा आहे (चोरी / पावसाचा धोका)' },
      damage: { title: 'ओरखडे / टायर पंक्चर', sub: 'वाहनाचे नुकसान, टायर पंक्चर किंवा गळती दिसत आहे' },
      emergency: { title: '🚨 आणीबाणीची परिस्थिती', sub: 'तातडीचे काम – मालकाने त्वरित लक्ष देणे आवश्यक आहे' },
      child: { title: '👶 आत मूल / पाळीव प्राणी आहे', sub: 'गंभीर सुरक्षा इशारा – वाहनाच्या आत कोणीतरी जिवंत आहे' },
      custom: { title: 'इतर संदेश / कस्टम टीप', sub: 'विशिष्ट तपशील किंवा पार्किंग सूचना लिहा' },
    },
  },
};
