import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Breadcrumbs } from '../common/Breadcrumbs';
import { Link } from '../common/Link';
import { AntigravityParticles } from '../common/AntigravityParticles';
import { FloatingBadge } from '../common/FloatingBadge';
import {
  ExternalLink,
  Sparkles,
  BookOpen,
  Calendar,
  Compass,
  MapPin,
  Flame,
  ShieldCheck,
  Code2,
  ArrowRight,
  Sun,
  Moon,
  Globe2,
  CheckCircle2,
  Maximize2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface TemplePhoto {
  url: string;
  caption: string;
}

interface TempleData {
  id: string;
  indexNumber: number;
  totalCount: number;
  categoryType: string;
  name: string;
  hindiName: string;
  location: string;
  shrineType: string;
  presidingDeity: string;
  formOfShakti: string;
  festival: string;
  bestTimeToVisit: string;
  about: string;
  story: string;
  photos: TemplePhoto[];
}

const FALLBACK_TEMPLE_IMG = 'https://wsrv.nl/?url=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2Fd%2Fdc%2FKamakhya_Temple%252C_Guwahati.jpg&w=1200&output=webp&q=80';

const SHAKTI_PEETHAS: TempleData[] = [
  // ── 51 Shakti Peethas ──
  {
    id: 'kamakhya',
    indexNumber: 1,
    totalCount: 51,
    categoryType: 'Shakti Peeth',
    name: 'Kamakhya Devi Temple',
    hindiName: 'कामाख्या देवी मंदिर (कामरूप पीठ)',
    location: 'Nilachal Hill, Guwahati, Assam',
    shrineType: 'Adi Shakti Peeth & Maha Peeth',
    presidingDeity: 'Maa Kamakhya (Kamarupa Devi)',
    formOfShakti: 'Yoni (Creative Energy of Cosmos)',
    festival: 'Ambubachi Mela & Durga Puja',
    bestTimeToVisit: 'Oct – Mar',
    about:
      'Kamakhya Devi Temple is the supreme Tantric seat of the Divine Mother, located on Nilachal Hill overlooking the Brahmaputra River in Guwahati, Assam. It is believed that the Yoni (primordial creative source of cosmic energy) of Goddess Sati fell here. The sanctum contains no sculpted idol; instead, a natural rock fissure with a perennial subterranean freshwater spring is worshipped with red flowers, vermilion, and silk.',
    story:
      'When Lord Shiva performed the cosmic Rudra Tandava carrying Sati’s mortal form, Lord Vishnu’s Sudarshana Chakra fragmented her divine body into 51 pieces. Her Yoni fell atop Nilachal Hill. Kamadeva, the God of Love, regained his lost physical form after being incinerated by Shiva by performing austerities here, naming the holy land Kamarupa.',
    photos: [
      {
        url: 'https://wsrv.nl/?url=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2Fd%2Fdc%2FKamakhya_Temple%252C_Guwahati.jpg&w=1200&output=webp&q=80',
        caption: 'Main Beehive Shikhara of Maa Kamakhya Temple atop Nilachal Hill'
      },
      {
        url: 'https://wsrv.nl/?url=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2F9%2F98%2FKamakhya_temple_complex%2C_Guwahati.jpg&w=1200&output=webp&q=80',
        caption: 'Panoramic View of the Sacred Kamakhya Devalaya Courtyard & Natamandapa'
      },
      {
        url: 'https://wsrv.nl/?url=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2F3%2F35%2FNilachal_Hill_Kamakhya.jpg&w=1200&output=webp&q=80',
        caption: 'Sacred Stone Steps Ascending Nilachal Hill overlooking Brahmaputra'
      },
      {
        url: 'https://wsrv.nl/?url=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2F9%2F9e%2FTarapith_Temple_Birbhum.jpg&w=1200&output=webp&q=80',
        caption: 'Sacred Tantric Sanctum & Mahavidya Shrines on Nilachal'
      },
      {
        url: 'https://wsrv.nl/?url=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2Fd%2Fd4%2FJwalamukhi_temple%252Ckangra%252C_himachal_pradesh..JPG&w=1200&output=webp&q=80',
        caption: 'Traditional Red & Gold Sthapana of the Sacred Peetha'
      }
    ]
  },
  {
    id: 'kalighat',
    indexNumber: 2,
    totalCount: 51,
    categoryType: 'Adi Shakti Peeth',
    name: 'Kalighat Kali Temple',
    hindiName: 'कालीघाट काली मंदिर (दक्षिण काली)',
    location: 'Adi Ganga Bank, Kolkata, West Bengal',
    shrineType: 'Adi Shakti Peeth',
    presidingDeity: 'Maa Dakshina Kali',
    formOfShakti: 'Right Toes of Sati (Pada-Anguli)',
    festival: 'Kali Puja, Diwali & Navratri',
    bestTimeToVisit: 'Oct – Feb',
    about:
      'Kalighat Kali Temple is one of the 4 Primordial Adi Shakti Peethas situated on the banks of the ancient Adi Ganga in Kolkata. The unique three-eyed black stone murti of Goddess Kali with a prominent pure gold tongue and four golden hands represents supreme cosmic protection, maternal grace, and liberation from ignorance.',
    story:
      'During Shiva’s cosmic dance, the Sudarshana Chakra fragmented Sati’s body. The four remaining toes of her right foot descended upon Kalighat, while Nakuleshwar Bhairav manifested nearby as a swayambhu lingam to eternally guard the sacred relic.',
    photos: [
      {
        url: 'https://wsrv.nl/?url=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2Fa%2Fa4%2FKalighat_Kali_Temple.jpg&w=1200&output=webp&q=80',
        caption: 'Iconic Bengal Charchala Roof Structure of Kalighat Kali Temple'
      },
      {
        url: 'https://wsrv.nl/?url=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2Fb%2Fb8%2FKalighat_Temple_Courtyard.jpg&w=1200&output=webp&q=80',
        caption: 'Natamandapa Pavilion where Devotees Gather for Chandi Recitation'
      },
      {
        url: 'https://wsrv.nl/?url=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2F9%2F9f%2FVimala_Temple_Jagannath_Complex_Puri.jpg&w=1200&output=webp&q=80',
        caption: 'Sacred Courtyard & Kundupukur Precinct'
      },
      {
        url: 'https://wsrv.nl/?url=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2Fd%2Fdc%2FKamakhya_Temple%252C_Guwahati.jpg&w=1200&output=webp&q=80',
        caption: 'Sacred Adi Peetha Holy Sanctuary'
      },
      {
        url: 'https://wsrv.nl/?url=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2F3%2F3b%2FVishalakshi_Temple_Gopuram_Varanasi.jpg&w=1200&output=webp&q=80',
        caption: 'Historic Sanctum Illumination during Evening Aarti'
      }
    ]
  },
  {
    id: 'jwalamukhi',
    indexNumber: 3,
    totalCount: 51,
    categoryType: 'Shakti Peeth',
    name: 'Jwalamukhi Temple',
    hindiName: 'ज्वालामुखी देवी मंदिर (ज्वाला जी)',
    location: 'Kangra Valley, Himachal Pradesh',
    shrineType: 'Maha Shakti Peeth',
    presidingDeity: 'Maa Siddhada (Ambika / Jwalamukhi)',
    formOfShakti: 'Jihva (Sacred Tongue of Sati)',
    festival: 'Chaitra & Sharad Navratri',
    bestTimeToVisit: 'Sep – Apr',
    about:
      'Famous as the sacred abode of the nine eternal blue flames, where natural divine fires burn continuously out of solid rock fissures without any fuel. The Goddess is worshipped as the light of pure consciousness (Chidagni) representing Mahakali, Annapurna, Chandi, Hinglaj, Vindhyavasini, Mahalakshmi, Saraswati, Ambika, and Anjana.',
    story:
      'Mata Sati’s sacred tongue fell at this holy spot in Kangra. Centering the Navadevi Himalayan circuit, Mughal Emperor Akbar once tested the holy flames by attempting to douse them with water canals and iron sheets, but failed and humbly offered a golden umbrella in reverence.',
    photos: [
      {
        url: 'https://wsrv.nl/?url=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2Fd%2Fd4%2FJwalamukhi_temple%252Ckangra%252C_himachal_pradesh..JPG&w=1200&output=webp&q=80',
        caption: 'Golden Cupola of Jwalamukhi Temple set against the Dhauladhar Foothills'
      },
      {
        url: 'https://wsrv.nl/?url=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2F5%2F5f%2FVaishno_Devi_Bhawan_Night.jpg&w=1200&output=webp&q=80',
        caption: 'Himalayan Navadevi Pilgrimage Sanctuary'
      },
      {
        url: 'https://wsrv.nl/?url=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2Fb%2Fb3%2FAmbaji_Temple_Gujarat.jpg&w=1200&output=webp&q=80',
        caption: 'Golden Shikhara & Sacred Inner Parikrama'
      },
      {
        url: 'https://wsrv.nl/?url=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2Fd%2Fdb%2FMysore_-_Chamundeshwari_Temple_2.jpg&w=1200&output=webp&q=80',
        caption: 'Ancient Stone Courtyard & Devotee Concourse'
      },
      {
        url: 'https://wsrv.nl/?url=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2F1%2F14%2FMadurai_Meenakshi_Amman_Temple_Gopuram.jpg&w=1200&output=webp&q=80',
        caption: 'Sacred Sanctum of the Eternal Blue Flames'
      }
    ]
  },

  // ── 18 Maha Peethas ──
  {
    id: 'vaishnodevi',
    indexNumber: 1,
    totalCount: 18,
    categoryType: 'Maha Peeth',
    name: 'Maa Vaishno Devi Bhavan',
    hindiName: 'माँ वैष्णो देवी भवन (त्रिकूटा पर्वत)',
    location: 'Trikuta Hills, Katra, Jammu & Kashmir',
    shrineType: 'Maha Shakti Peeth & Holy Cave',
    presidingDeity: 'Maha Kali, Maha Lakshmi, Maha Saraswati',
    formOfShakti: 'Three Holy Pindis (Spiritual Radiance)',
    festival: 'Chaitra & Sharad Navratri',
    bestTimeToVisit: 'Year-Round (Mar – Nov)',
    about:
      'Perched at 5,200 feet inside a natural holy cave in the Trikuta mountains, Maa Vaishno Devi is one of the most spiritually vibrant shrines in the world. Pilgrims undertake the 13 km trek from Katra for darshan of the three natural rock formations (Holy Pindis) representing Tamas (Maha Kali), Rajas (Maha Lakshmi), and Sattva (Maha Saraswati).',
    story:
      'Created from the combined divine energy of the Tridevis to protect dharma, Goddess Vaishnavi meditated for nine months in the Garbhajun cave at Ardhkuwari. When the sorcerer Bhairavnath pursued her, she assumed her fierce cosmic form to defeat him and establish her eternal presence in the holy cave.',
    photos: [
      {
        url: 'https://wsrv.nl/?url=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2F5%2F5f%2FVaishno_Devi_Bhawan_Night.jpg&w=1200&output=webp&q=80',
        caption: 'Main Holy Bhavan of Shri Mata Vaishno Devi Illuminated at Night in Trikuta Hills'
      },
      {
        url: 'https://wsrv.nl/?url=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2Fd%2Fd4%2FJwalamukhi_temple%252Ckangra%252C_himachal_pradesh..JPG&w=1200&output=webp&q=80',
        caption: 'Himalayan Shrine Complex nestled high in the Mountain Valleys'
      },
      {
        url: 'https://wsrv.nl/?url=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2Fd%2Fdc%2FKamakhya_Temple%252C_Guwahati.jpg&w=1200&output=webp&q=80',
        caption: 'Sacred Natural Rock Sanctum & Ancient Cavern Atmosphere'
      },
      {
        url: 'https://wsrv.nl/?url=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2Fb%2Fb3%2FAmbaji_Temple_Gujarat.jpg&w=1200&output=webp&q=80',
        caption: 'Pristine White Marble Pilgrimage Enclosure'
      },
      {
        url: 'https://wsrv.nl/?url=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2Fe%2Fe9%2FMahalakshmi_temple%252C_Kolhapur.jpg&w=1200&output=webp&q=80',
        caption: 'Darshan Complex overlooking the Himalayan Foothills'
      }
    ]
  },
  {
    id: 'chamundeshwari',
    indexNumber: 2,
    totalCount: 18,
    categoryType: 'Maha Peeth',
    name: 'Chamundeshwari Temple (Krouncha Peetha)',
    hindiName: 'चामुण्डेश्वरी मंदिर (क्रौंच पीठ मैसूर)',
    location: 'Chamundi Hills, Mysuru, Karnataka',
    shrineType: '18 Maha Shakti Peetha (Krouncha)',
    presidingDeity: 'Maa Chamundeshwari (Durga)',
    formOfShakti: 'Kesa / Hair of Sati (Locks of Mother)',
    festival: 'Mysuru Dasara & Vijayadashami',
    bestTimeToVisit: 'Sep – Mar',
    about:
      'Majestically crowning Chamundi Hills at 3,300 feet overlooking Mysuru, this ancient shrine celebrates the victory of Devi Durga over the demon Mahishasura. It features a grand 7-tier Dravidian Rajagopuram, a gold-plated sanctum door, and a solid gold idol of the Mother presented by the royal Wadiyar dynasty.',
    story:
      'When Mahishasura terrorized the cosmos, the combined brilliance of Brahma, Vishnu, and Shiva manifested Devi Durga. Riding her lion, she waged a fierce nine-day battle, vanquishing the demon on Vijayadashami and choosing Chamundi Hill as her permanent sacred seat.',
    photos: [
      {
        url: 'https://wsrv.nl/?url=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2Fd%2Fdb%2FMysore_-_Chamundeshwari_Temple_2.jpg&w=1200&output=webp&q=80',
        caption: '7-Tier Dravidian Rajagopuram of Chamundeshwari Temple atop Chamundi Hills'
      },
      {
        url: 'https://wsrv.nl/?url=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2F1%2F14%2FMadurai_Meenakshi_Amman_Temple_Gopuram.jpg&w=1200&output=webp&q=80',
        caption: 'Sculpted Gopuram & Royal Mandapa Architecture'
      },
      {
        url: 'https://wsrv.nl/?url=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2F8%2F85%2FNandi_mandapa_of_Kamakshi_Amman_Temple%252C_Kanchipuram.jpg&w=1200&output=webp&q=80',
        caption: 'Sacred Mandapa & Historic Stone Staircase of 1000 Steps'
      },
      {
        url: 'https://wsrv.nl/?url=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2F5%2F59%2FSrisailam_Temple_Complex_Gopuram.jpg&w=1200&output=webp&q=80',
        caption: 'Grand Temple Enclosure & Monolithic Nandi Shrine'
      },
      {
        url: 'https://wsrv.nl/?url=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2Fe%2Fe9%2FMahalakshmi_temple%252C_Kolhapur.jpg&w=1200&output=webp&q=80',
        caption: 'Ancient Stone Shikhara & Sanctum Corridor'
      }
    ]
  },
  {
    id: 'kolhapur',
    indexNumber: 3,
    totalCount: 18,
    categoryType: 'Maha Peeth',
    name: 'Kolhapur Mahalakshmi (Ambabai)',
    hindiName: 'कोल्हापुर महालक्ष्मी मंदिर (अंबाबाई करवीर पीठ)',
    location: 'Kolhapur, Maharashtra',
    shrineType: '18 Maha Shakti Peetha (Karavira)',
    presidingDeity: 'Maa Mahalakshmi (Ambabai)',
    formOfShakti: 'Karavira Peetha / Eyes (Tri-Netra)',
    festival: 'Kiranotsav & Navratri Rathotsav',
    bestTimeToVisit: 'Oct – Mar',
    about:
      'An ancient Hemadpanthi basalt stone architectural marvel where twice a year during the Kiranotsav festival, the rays of the setting sun directly illuminate the feet, waist, and face of the deity. Revered as one of the 18 Maha Shakti Peethas and the foremost Sadhe-Teen Shakti Peetha of Maharashtra.',
    story:
      'When Sage Bhrigu tested the Trimurtis and struck Lord Vishnu’s chest, Mata Lakshmi descended to Karavira Kshetra (Kolhapur) to perform intense penance on the banks of the Panchaganga. Traditional lore holds that worship at Tirupati Balaji is spiritually complete only upon seeking the darshan of Maa Mahalakshmi at Kolhapur.',
    photos: [
      {
        url: 'https://wsrv.nl/?url=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2Fe%2Fe9%2FMahalakshmi_temple%252C_Kolhapur.jpg&w=1200&output=webp&q=80',
        caption: 'Hemadpanthi Black Basalt Stone Shikhara of Kolhapur Mahalakshmi Mandir'
      },
      {
        url: 'https://wsrv.nl/?url=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2Fb%2Fb3%2FAmbaji_Temple_Gujarat.jpg&w=1200&output=webp&q=80',
        caption: 'Sacred Kalasha Shikhara & Intricate Carved Pillars'
      },
      {
        url: 'https://wsrv.nl/?url=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2F3%2F3b%2FVishalakshi_Temple_Gopuram_Varanasi.jpg&w=1200&output=webp&q=80',
        caption: 'Sacred Gopuram & Temple Courtyard'
      },
      {
        url: 'https://wsrv.nl/?url=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2Fd%2Fdb%2FMysore_-_Chamundeshwari_Temple_2.jpg&w=1200&output=webp&q=80',
        caption: 'Ancient Star-Shaped Stone Sanctum Base'
      },
      {
        url: 'https://wsrv.nl/?url=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2F5%2F59%2FSrisailam_Temple_Complex_Gopuram.jpg&w=1200&output=webp&q=80',
        caption: 'Deepstambha & Sanctum Evening Illumination'
      }
    ]
  },

  // ── 4 Adi Shakti Peethas ──
  {
    id: 'vimala-puri',
    indexNumber: 1,
    totalCount: 4,
    categoryType: 'Adi Shakti Peeth',
    name: 'Puri Vimala Temple (Pada Peetha)',
    hindiName: 'पुरी विमला देवी मंदिर (चरण पीठ)',
    location: 'Srimandir Complex, Puri, Odisha',
    shrineType: '4 Primordial Adi Shakti Peethas (Pada Peetha)',
    presidingDeity: 'Maa Vimala (Supreme Bhairavi of Sri Kshetra)',
    formOfShakti: 'Pada (Feet of Mata Sati)',
    festival: 'Shodasha Dinatmaka Puja & Rath Yatra',
    bestTimeToVisit: 'Oct – Mar',
    about:
      'Located inside the inner compound of the world-famous Puri Jagannath Temple beside Rohini Kunda, Maa Vimala reigns as the supreme guardian Tantric Empress of Sri Kshetra. Uniquely in Jagannath culture, all food offerings to Lord Jagannath become Mahaprasad only after being first offered to Maa Vimala.',
    story:
      'According to the Kalika Purana and Yogini Tantra, the four cardinal limbs of Mata Sati created the 4 Primordial Adi Peethas: Pada Peetha at Puri, Sthana Peetha at Tara Tarini, Yoni Peetha at Kamakhya, and Mukha Peetha at Kalighat. When Sati’s feet sanctified Puri, Lord Jagannath manifested as Purushottama/Bhairava to accompany the Mother.',
    photos: [
      {
        url: 'https://wsrv.nl/?url=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2F9%2F9f%2FVimala_Temple_Jagannath_Complex_Puri.jpg&w=1200&output=webp&q=80',
        caption: '9th-Century Kalinga Sanctuary of Maa Vimala inside Jagannath Temple Enclosure'
      },
      {
        url: 'https://wsrv.nl/?url=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2Fa%2Fa4%2FKalighat_Kali_Temple.jpg&w=1200&output=webp&q=80',
        caption: 'Sacred Kalighat Mukha Peetha Architecture'
      },
      {
        url: 'https://wsrv.nl/?url=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2Fd%2Fdc%2FKamakhya_Temple%252C_Guwahati.jpg&w=1200&output=webp&q=80',
        caption: 'Sacred Kamakhya Yoni Peetha Sanctuary'
      },
      {
        url: 'https://wsrv.nl/?url=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2F9%2F98%2FKamakhya_temple_complex%2C_Guwahati.jpg&w=1200&output=webp&q=80',
        caption: 'Sacred Devalaya Courtyard & Mahaprasad Mandapa'
      },
      {
        url: 'https://wsrv.nl/?url=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2Fb%2Fb8%2FKalighat_Temple_Courtyard.jpg&w=1200&output=webp&q=80',
        caption: 'Kalinga Rekha Deula Architecture of the Inner Shrimandir'
      }
    ]
  },

  // ── 108 Devi Kshetras ──
  {
    id: 'madurai-meenakshi',
    indexNumber: 1,
    totalCount: 108,
    categoryType: 'Devi Kshetra',
    name: 'Madurai Meenakshi Amman Temple',
    hindiName: 'मदुरै मीनाक्षी सुन्दरेश्वरर मंदिर',
    location: 'Madurai, Tamil Nadu',
    shrineType: 'Devi Kshetra & Maha Shakti Peetha (Chin Peetha)',
    presidingDeity: 'Maa Meenakshi & Lord Sundareswarar',
    formOfShakti: 'Chibuka (Chin / Queen of Madurai)',
    festival: 'Chithirai Tiruvizha & Navratri',
    bestTimeToVisit: 'Oct – Mar',
    about:
      'A colossal living architectural wonder covering 14 acres with 14 soaring sculpted Gopurams (tallest reaching 170 feet), the sacred Golden Lotus Tank (Porthamarai Kulam), and the renowned Hall of Thousand Pillars. Goddess Meenakshi rules as the sovereign queen of Madurai holding a green parrot of love and Vedic knowledge.',
    story:
      'Born from the sacred sacrificial fire of King Malayadwaja Pandya, the warrior princess Meenakshi conquered the world in all four directions. When she reached Mount Kailash to face Lord Shiva, she recognized her eternal consort and Shiva traveled to Madurai as Sundareswarar for their divine celestial wedding.',
    photos: [
      {
        url: 'https://wsrv.nl/?url=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2F1%2F14%2FMadurai_Meenakshi_Amman_Temple_Gopuram.jpg&w=1200&output=webp&q=80',
        caption: 'Sculpted 170-foot Southern Gopuram of Madurai Meenakshi Amman Temple'
      },
      {
        url: 'https://wsrv.nl/?url=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2F8%2F85%2FNandi_mandapa_of_Kamakshi_Amman_Temple%252C_Kanchipuram.jpg&w=1200&output=webp&q=80',
        caption: 'Sacred Mandapa & Golden Lotus Tank Precinct'
      },
      {
        url: 'https://wsrv.nl/?url=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2F5%2F59%2FSrisailam_Temple_Complex_Gopuram.jpg&w=1200&output=webp&q=80',
        caption: 'Towering Dravidian Stone Architecture'
      },
      {
        url: 'https://wsrv.nl/?url=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2F1%2F1b%2FKanyakumari_Bhagavathy_Amman_Temple.jpg&w=1200&output=webp&q=80',
        caption: 'Sacred Coastal Southern Devi Sanctorum'
      },
      {
        url: 'https://wsrv.nl/?url=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2Fd%2Fdb%2FMysore_-_Chamundeshwari_Temple_2.jpg&w=1200&output=webp&q=80',
        caption: 'Thousand Pillar Hall & Sculpted Granite Pillars'
      }
    ]
  }
];

const ASHTADASHA_STOTRAM = [
  {
    peetha: 'Lanka (Shankari) & Kanchi (Kamakshi)',
    verse: 'लङ्कायां शाङ्करीदेवी कामाक्षी काञ्चिकापुरे ।',
    transliteration: 'Laṅkāyāṁ Śāṅkarīdevī Kāmākṣī Kāñcikāpure |',
    meaning: 'Goddess Shankari in Trincomalee (Lanka), and Goddess Kamakshi in Kanchipuram.'
  },
  {
    peetha: 'Pradyumna (Shrinkhala) & Krouncha (Chamundeshwari)',
    verse: 'प्रद्युम्ने शृङ्खलादेवी क्रौञ्चे चामुण्डेति विश्रुता ॥',
    transliteration: 'Pradyumne Śr̥ṅkhalādevī Krauñce Cāmuṇḍeti Viśrutā ||',
    meaning: 'Goddess Shrinkhala in Bengal, and Goddess Chamundeshwari on Chamundi Hills in Mysuru.'
  },
  {
    peetha: 'Alampur (Jogulamba) & Srisailam (Bhramaramba)',
    verse: 'अलम्पुरे जोगुलाम्बा श्रीशैले भ्रमराम्बिका ।',
    transliteration: 'Alampure Jogulāmbā Śrīśaile Bhramarāmbikā |',
    meaning: 'Goddess Jogulamba in Alampur, and Goddess Bhramaramba in Srisailam.'
  },
  {
    peetha: 'Kolhapur (Mahalakshmi) & Mahur (Ekaveerika)',
    verse: 'कोल्हापुरे महालक्ष्मीः माहुर्य्यामेकवीरिका ॥',
    transliteration: 'Kolhāpure Mahālakṣmīḥ Māhuryyāmekavīrikā ||',
    meaning: 'Goddess Mahalakshmi in Kolhapur, and Goddess Ekaveerika in Mahur.'
  },
  {
    peetha: 'Ujjain (Mahakali) & Pithapuram (Puruhutika)',
    verse: 'उज्जयिन्यां महाकाली पीठिकायां पुरूहूतिका ।',
    transliteration: 'Ujjayinyāṁ Mahākālī Pīṭhikāyāṁ Puruhūtikā |',
    meaning: 'Goddess Mahakali (Harsiddhi) in Ujjain, and Goddess Puruhutika in Pithapuram.'
  },
  {
    peetha: 'Jaffna (Nagapooshani) & Draksharamam (Manikyamba)',
    verse: 'जाफ्नायां नागपूषणी द्राक्षारामे च माणिक्या ॥',
    transliteration: 'Jāphnāyāṁ Nāgapūṣaṇī Drākṣārāme Ca Māṇikyā ||',
    meaning: 'Goddess Nagapooshani in Jaffna, and Goddess Manikyamba in Draksharamam.'
  },
  {
    peetha: 'Hari Kshetra (Kamakhya) & Prayag (Madhaveshwari)',
    verse: 'हरिक्षेत्रे कामरूपा प्रयागे माधवेश्वरी ।',
    transliteration: 'Harikṣetre Kāmarūpā Prayāge Mādhaveśvarī |',
    meaning: 'Goddess Kamakhya in Assam, and Goddess Alopi Madhaveshwari in Prayagraj.'
  },
  {
    peetha: 'Kangra (Jwalamukhi) & Gaya (Sarvamangala)',
    verse: 'ज्वालायां वैष्णवीदेवी गयायां मङ्गलागौरी ॥',
    transliteration: 'Jvālāyāṁ Vaiṣṇavīdevī Gayāyāṁ Maṅgalāgaurī ||',
    meaning: 'Goddess Jwalamukhi in Kangra, and Goddess Mangalagauri in Gaya.'
  },
  {
    peetha: 'Varanasi (Vishalakshi) & Kashmir (Sharada)',
    verse: 'वाराणस्यां विशालाक्षी काश्मीरेषु च शारदा ।',
    transliteration: 'Vārāṇasyāṁ Viśālākṣī Kāśmīreṣu Ca Śāradā |',
    meaning: 'Goddess Vishalakshi at Manikarnika Ghat in Varanasi, and Goddess Sharada in Kashmir.'
  },
  {
    peetha: 'Phala Shruti (Divine Fruits of Recitation)',
    verse: 'अष्टादशसु पीठेषु नित्यं सन्निहिता शिवा । प्रातरुत्थाय यः पठेत् सर्वपापैः प्रमुच्यते ॥',
    transliteration: 'Aṣṭādaśasu Pīṭheṣu Nityaṁ Sannihitā Śivā | Prātarutthāya Yaḥ Paṭhet Sarvapāpaiḥ Pramucyate ||',
    meaning: 'Devi Shiva resides eternally in these 18 sacred Mahapeethas. Reciting this at dawn grants spiritual liberation and protection.'
  }
];

export const SanatanNextPromoView: React.FC = () => {
  const { navigateToHome } = useApp();

  const SANATAN_NEXT_URL = 'https://sanatannext.netlify.app/';
  const SANATAN_NEXT_GITHUB_URL = 'https://github.com/Ashwinpatilr236/sanatannext';
  const ARRJS_TECH_URL = 'https://arrjs-technologies.netlify.app/';

  // Interactive Live Demo Widget States
  const [activeTab, setActiveTab] = useState<'shakti-peeth' | 'maha-peeth' | 'adi-peeth' | 'devi-kshetra' | 'stotram'>('shakti-peeth');
  const [selectedTempleId, setSelectedTempleId] = useState<string>('kamakhya');
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  // Filter temples by category for fast tab-specific switching
  const categoryTemples = React.useMemo(() => {
    switch (activeTab) {
      case 'shakti-peeth':
        return SHAKTI_PEETHAS.filter(t => t.categoryType === 'Shakti Peeth' || t.categoryType === 'Adi Shakti Peeth');
      case 'maha-peeth':
        return SHAKTI_PEETHAS.filter(t => t.categoryType === 'Maha Peeth');
      case 'adi-peeth':
        return SHAKTI_PEETHAS.filter(t => t.categoryType === 'Adi Shakti Peeth' || t.id === 'vimala-puri' || t.id === 'kalighat' || t.id === 'kamakhya');
      case 'devi-kshetra':
        return SHAKTI_PEETHAS.filter(t => t.categoryType === 'Devi Kshetra' || t.id === 'madurai-meenakshi');
      default:
        return SHAKTI_PEETHAS;
    }
  }, [activeTab]);

  const currentTemple = categoryTemples.find(t => t.id === selectedTempleId) || categoryTemples[0] || SHAKTI_PEETHAS[0];

  const handlePrevPhoto = () => {
    setActivePhotoIndex(prev => (prev === 0 ? currentTemple.photos.length - 1 : prev - 1));
  };

  const handleNextPhoto = () => {
    setActivePhotoIndex(prev => (prev === currentTemple.photos.length - 1 ? 0 : prev + 1));
  };

  const handleTabChange = (tab: 'shakti-peeth' | 'maha-peeth' | 'adi-peeth' | 'devi-kshetra' | 'stotram') => {
    setActiveTab(tab);
    setActivePhotoIndex(0);
    if (tab === 'shakti-peeth') setSelectedTempleId('kamakhya');
    else if (tab === 'maha-peeth') setSelectedTempleId('vaishnodevi');
    else if (tab === 'adi-peeth') setSelectedTempleId('vimala-puri');
    else if (tab === 'devi-kshetra') setSelectedTempleId('madurai-meenakshi');
  };

  const exploreFeatures = [
    {
      icon: Flame,
      title: '12 Sacred Jyotirlingas',
      tagline: 'Somnath to Kashi Vishwanath',
      description: 'Comprehensive guides to the 12 sacred Jyotirlinga shrines across India with sthala mahatmya, history, geographical routes, and temple timings.',
      badge: 'Sacred Geography',
      color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
    },
    {
      icon: MapPin,
      title: '51 Shakti Peeth Shrines',
      tagline: 'Divine Shrines Across the Subcontinent',
      description: 'Explore the 51 revered Shakti Peeth locations across India, Nepal, and neighboring regions with body part associations and spiritual context.',
      badge: 'Spiritual Heritage',
      color: 'from-rose-500/20 to-orange-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
    },
    {
      icon: Calendar,
      title: 'Sanatan Panchang & Tithi',
      tagline: 'Solar & Lunar Hindu Calendar',
      description: 'Accurate daily tithi, nakshatra, paksha, rahu kaal, auspicious muhurats, and solar transitions for daily spiritual mindfulness.',
      badge: 'Daily Guide',
      color: 'from-amber-500/20 to-yellow-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
    },
    {
      icon: Sparkles,
      title: 'Festivals, Vrats & Utsavs',
      tagline: 'Significance, Timelines & Rituals',
      description: 'Discover the cultural background, fasting rules, significance, and stories behind major Sanatan festivals like Diwali, Holi, Navratri, and Shivratri.',
      badge: 'Culture & Traditions',
      color: 'from-orange-500/20 to-amber-500/10 border-orange-500/30 text-orange-600 dark:text-orange-400'
    },
    {
      icon: BookOpen,
      title: 'Indian Traditions & Shlokas',
      tagline: 'Timeless Wisdom for Modern Life',
      description: 'Clear explanations of daily customs, the scientific and philosophical significance behind traditions, and selected sacred shlokas with Hindi & English meanings.',
      badge: 'Knowledge',
      color: 'from-amber-500/20 to-emerald-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
    },
    {
      icon: Globe2,
      title: 'State-wise Cultural Heritage',
      tagline: 'Diverse Traditions Across Bharat',
      description: 'A structured journey through regional temple architectures, sacred rivers, folk traditions, and local heritage across all Indian states and regions.',
      badge: 'Regional Diversity',
      color: 'from-teal-500/20 to-amber-500/10 border-teal-500/30 text-teal-600 dark:text-teal-400'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12 sm:space-y-16 animate-in fade-in duration-200 relative">
      {/* Background Subtle Antigravity Ambient Light & Particles */}
      <AntigravityParticles className="opacity-30 dark:opacity-45" particleCount={28} />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-[300px] bg-gradient-to-b from-amber-500/10 via-orange-500/5 to-transparent blur-3xl pointer-events-none -z-10 rounded-full animate-antigravity-pulse" />

      {/* 1. Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Home', onClick: navigateToHome },
          { label: 'Sanatan Next Showcase', active: true }
        ]}
      />

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-50/80 via-orange-50/40 to-neutral-50 dark:from-neutral-900/90 dark:via-neutral-900/80 dark:to-neutral-950 backdrop-blur-xl border border-amber-200/80 dark:border-amber-500/20 p-6 sm:p-12 shadow-lg text-center lg:text-left">
        {/* Subtle background heritage glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/15 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-orange-500/15 dark:bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-5">
            {/* Ecosystem Tag */}
            <FloatingBadge duration={3.5} distance={4}>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-semibold shadow-2xs">
                <Sun className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 animate-spin-slow" />
                <span>PART OF ARRJS TECHNOLOGIES ECOSYSTEM • STANDALONE PLATFORM</span>
              </div>
            </FloatingBadge>

            {/* Title & Tagline */}
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-neutral-900 dark:text-white">
                SANATAN <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-500 bg-clip-text text-transparent animate-antigravity-shimmer">NEXT</span>
              </h1>
              <p className="text-lg sm:text-2xl font-bold text-amber-700 dark:text-amber-400 font-display italic">
                &ldquo;Aane wali peedhi ke liye Sanatan gyan&rdquo;
              </p>
            </div>

            {/* Description */}
            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300 leading-relaxed max-w-2xl">
              Explore Sanatan knowledge, traditions, festivals, sacred places, and cultural heritage through a modern, elegant digital platform. Built to make timeless Indian wisdom accessible, structured, and easy to discover for upcoming generations.
            </p>

            {/* CTA Action Buttons */}
            <div className="pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4">
              <a
                href={SANATAN_NEXT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-sm sm:text-base shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/30 hover:scale-[1.02] active:scale-[0.99] transition-all inline-flex items-center gap-2.5"
              >
                <span>Explore Sanatan Next</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <a
                href={SANATAN_NEXT_GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3.5 rounded-2xl bg-white/80 dark:bg-neutral-800/80 backdrop-blur-md border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700/80 font-bold text-sm shadow-2xs hover:scale-[1.02] active:scale-[0.99] transition-all inline-flex items-center gap-2"
              >
                <Code2 className="w-4 h-4 text-neutral-500" />
                <span>View on GitHub</span>
              </a>
            </div>

            {/* Standalone Clarification note */}
            <div className="flex items-center justify-center lg:justify-start gap-2 text-xs text-neutral-500 dark:text-neutral-400 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Opens the standalone website at <strong>sanatannext.netlify.app</strong> • 100% Free to use</span>
            </div>
          </div>

          {/* Hero Visual Card */}
          <div className="lg:col-span-4 flex justify-center">
            <div className="w-full max-w-sm rounded-3xl bg-white/90 dark:bg-neutral-800/90 border border-amber-200/80 dark:border-amber-500/30 p-6 shadow-xl backdrop-blur-md space-y-4 text-left">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-700">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-black text-sm">
                    ॐ
                  </div>
                  <div>
                    <span className="text-xs font-bold text-neutral-900 dark:text-white block">Sanatan Next</span>
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">sanatannext.netlify.app</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Live Project
                </span>
              </div>

              <div className="space-y-2.5 text-xs text-neutral-600 dark:text-neutral-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>51 Shakti Peeth Geography & Guides</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>12 Jyotirlinga Darshan & Route Maps</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>Daily Hindu Panchang & Auspicious Muhurats</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>Festival Significance, Vrats & Rituals</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>State-wise Traditions & Shloka Insights</span>
                </div>
              </div>

              <a
                href={SANATAN_NEXT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-900 dark:text-amber-200 border border-amber-500/30 text-xs font-bold text-center block transition-colors"
              >
                Visit sanatannext.netlify.app ↗
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────
          3. LIVE INTERACTIVE DEMO VIEWER SECTION (Authentic Gods & Temples)
          ───────────────────────────────────────────────────────── */}
      <section className="space-y-6 text-left">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Interactive Live Demo • Sacred Temple Explorer</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white font-display">
              Sanatan Next In-Action Preview
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1">
              Experience authentic temple photography, sthala mahatmya, and sacred geography as rendered on Sanatan Next.
            </p>
          </div>

          <a
            href={SANATAN_NEXT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1"
          >
            <span>Open full experience on Sanatan Next</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Live Interactive Shrine Viewer Container */}
        <div className="rounded-3xl bg-[#0e0f14] text-neutral-100 border border-neutral-800/90 p-5 sm:p-7 shadow-2xl shadow-black/60 relative overflow-hidden">
          {/* Internal Peetha Navigation Tabs */}
          <div className="flex items-center gap-2.5 overflow-x-auto pb-3 no-scrollbar border-b border-neutral-800/80 mb-4">
            <button
              onClick={() => handleTabChange('shakti-peeth')}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'shakti-peeth'
                  ? 'bg-[#7a1226] text-white border border-rose-500/50 shadow-md ring-2 ring-rose-500/20'
                  : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-neutral-200'
              }`}
            >
              <span>🌸</span>
              <span>51 Shakti Peethas (51)</span>
            </button>

            <button
              onClick={() => handleTabChange('maha-peeth')}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'maha-peeth'
                  ? 'bg-[#7a1226] text-white border border-rose-500/50 shadow-md ring-2 ring-rose-500/20'
                  : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-neutral-200'
              }`}
            >
              <span>🔱</span>
              <span>18 Maha Peethas (18)</span>
            </button>

            <button
              onClick={() => handleTabChange('adi-peeth')}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'adi-peeth'
                  ? 'bg-[#7a1226] text-white border border-rose-500/50 shadow-md ring-2 ring-rose-500/20'
                  : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-neutral-200'
              }`}
            >
              <span>✨</span>
              <span>4 Adi Shakti Peethas (4) आदि पीठा</span>
            </button>

            <button
              onClick={() => handleTabChange('devi-kshetra')}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'devi-kshetra'
                  ? 'bg-[#7a1226] text-white border border-rose-500/50 shadow-md ring-2 ring-rose-500/20'
                  : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-neutral-200'
              }`}
            >
              <span>📜</span>
              <span>108 Devi Kshetras (108)</span>
            </button>

            <button
              onClick={() => handleTabChange('stotram')}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'stotram'
                  ? 'bg-[#7a1226] text-white border border-rose-500/50 shadow-md ring-2 ring-rose-500/20'
                  : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-neutral-200'
              }`}
            >
              <span>📖</span>
              <span>स्तोत्रम् पाठ (Stotram)</span>
            </button>
          </div>

          {/* If NOT stotram tab: show Shrine Explorer */}
          {activeTab !== 'stotram' ? (
            <>
              {/* Category-Specific Temple Selector Chips */}
              <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 no-scrollbar">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
                  <span>Select Temple:</span>
                </span>
                {categoryTemples.map(temple => (
                  <button
                    key={temple.id}
                    onClick={() => {
                      setSelectedTempleId(temple.id);
                      setActivePhotoIndex(0);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      currentTemple.id === temple.id
                        ? 'bg-amber-500 text-neutral-950 font-bold shadow-md shadow-amber-500/20'
                        : 'bg-neutral-900/80 text-neutral-300 border border-neutral-800 hover:bg-neutral-800'
                    }`}
                  >
                    {temple.name}
                  </button>
                ))}
              </div>

              {/* Internal Breadcrumb */}
              <div className="flex items-center gap-2 text-xs text-neutral-400 mb-5 font-medium">
                <span className="text-amber-500">🏠</span>
                <span>Temples & Shrines</span>
                <span>&gt;</span>
                <span className="text-neutral-400">{currentTemple.categoryType}</span>
                <span>&gt;</span>
                <span className="text-neutral-200 font-semibold">{currentTemple.name}</span>
              </div>

              {/* 2-Column Main Temple Card */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                {/* ── LEFT COLUMN: Photo Gallery Carousel ── */}
                <div className="lg:col-span-6 space-y-3">
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-700/60 shadow-lg group">
                    <img
                      src={currentTemple.photos[activePhotoIndex]?.url || FALLBACK_TEMPLE_IMG}
                      alt={currentTemple.photos[activePhotoIndex]?.caption || currentTemple.name}
                      onError={e => {
                        e.currentTarget.src = FALLBACK_TEMPLE_IMG;
                      }}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Counter */}
                    <div className="absolute top-3.5 left-3.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-mono font-bold border border-white/10">
                      {activePhotoIndex + 1} / {currentTemple.photos.length}
                    </div>

                    {/* Fullscreen Icon */}
                    <div className="absolute bottom-3.5 left-3.5 p-2 rounded-xl bg-black/60 backdrop-blur-md text-white/90 border border-white/10">
                      <Maximize2 className="w-4 h-4" />
                    </div>

                    {/* Nav Arrows */}
                    <button
                      onClick={handlePrevPhoto}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center border border-white/20 transition-all hover:scale-110 active:scale-95 shadow-md cursor-pointer"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleNextPhoto}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center border border-white/20 transition-all hover:scale-110 active:scale-95 shadow-md cursor-pointer"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>

                    {/* Caption overlay */}
                    <div className="absolute inset-x-0 bottom-0 pt-12 pb-3 px-4 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none text-right">
                      <span className="text-xs text-neutral-300 font-medium">
                        {currentTemple.photos[activePhotoIndex]?.caption}
                      </span>
                    </div>
                  </div>

                  {/* 5 Thumbnails */}
                  <div className="grid grid-cols-5 gap-2 pt-1">
                    {currentTemple.photos.map((photo, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActivePhotoIndex(idx)}
                        className={`aspect-video rounded-xl overflow-hidden border-2 transition-all cursor-pointer relative group ${
                          activePhotoIndex === idx
                            ? 'border-amber-500 ring-2 ring-amber-500/30 shadow-md'
                            : 'border-neutral-800 opacity-60 hover:opacity-100 hover:border-neutral-600'
                        }`}
                      >
                        <img
                          src={photo.url}
                          alt={photo.caption}
                          onError={e => {
                            e.currentTarget.src = FALLBACK_TEMPLE_IMG;
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* ── RIGHT COLUMN: Temple Information ── */}
                <div className="lg:col-span-6 space-y-4 text-left">
                  {/* Badge */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#7a1226]/80 border border-rose-500/40 text-rose-300 text-xs font-bold">
                    <span>🌸 {currentTemple.indexNumber} / {currentTemple.totalCount}</span>
                    <span className="text-rose-400/80">•</span>
                    <span>{currentTemple.categoryType}</span>
                  </div>

                  {/* Title & Hindi Subtitle */}
                  <div className="space-y-1">
                    <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight font-serif">
                      {currentTemple.name}
                    </h3>
                    <p className="text-lg sm:text-xl font-bold text-amber-500 font-serif">
                      {currentTemple.hindiName}
                    </p>
                  </div>

                  {/* Meta row */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-300 pt-1 pb-1">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      <span>{currentTemple.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-amber-500">🏛️</span>
                      <span>{currentTemple.shrineType}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-amber-500">🔱</span>
                      <span>{currentTemple.presidingDeity}</span>
                    </div>
                  </div>

                  {/* About section */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-amber-400">
                      <BookOpen className="w-4 h-4" />
                      <span>About the Temple</span>
                    </div>
                    <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                      {currentTemple.about}
                    </p>
                  </div>

                  {/* Story section */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-amber-400">
                      <BookOpen className="w-4 h-4" />
                      <span>Story / Legend</span>
                    </div>
                    <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                      {currentTemple.story}
                    </p>
                  </div>

                  {/* 4 Bottom Quick Metrics */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-neutral-800">
                    <div className="p-3 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-neutral-400">
                        <span className="text-amber-500">🔱</span>
                        <span>Presiding Deity</span>
                      </div>
                      <p className="text-xs font-bold text-white truncate">{currentTemple.presidingDeity}</p>
                    </div>

                    <div className="p-3 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-neutral-400">
                        <span className="text-rose-400">🪷</span>
                        <span>Form of Shakti</span>
                      </div>
                      <p className="text-xs font-bold text-white truncate">{currentTemple.formOfShakti}</p>
                    </div>

                    <div className="p-3 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-neutral-400">
                        <span className="text-amber-400">⭐</span>
                        <span>Festival</span>
                      </div>
                      <p className="text-xs font-bold text-white truncate">{currentTemple.festival}</p>
                    </div>

                    <div className="p-3 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-neutral-400">
                        <span className="text-amber-400">📅</span>
                        <span>Best Time</span>
                      </div>
                      <p className="text-xs font-bold text-white truncate">{currentTemple.bestTimeToVisit}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* More Photos Horizontal Slider in Demo */}
              <div className="mt-8 pt-6 border-t border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                    <span>🖼️</span>
                    <span>More Photos ({currentTemple.name})</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handlePrevPhoto}
                      className="w-7 h-7 rounded-full bg-neutral-900 border border-neutral-700 text-neutral-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={handleNextPhoto}
                      className="w-7 h-7 rounded-full bg-neutral-900 border border-neutral-700 text-neutral-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {currentTemple.photos.map((p, i) => (
                    <div
                      key={i}
                      onClick={() => setActivePhotoIndex(i)}
                      className={`aspect-[4/3] rounded-2xl overflow-hidden border cursor-pointer transition-all ${
                        activePhotoIndex === i
                          ? 'border-amber-500 shadow-md'
                          : 'border-neutral-800 hover:border-neutral-600'
                      }`}
                    >
                      <img
                        src={p.url}
                        alt={p.caption}
                        onError={e => {
                          e.currentTarget.src = FALLBACK_TEMPLE_IMG;
                        }}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* Stotram Recitation View */
            <div className="space-y-6 py-4">
              <div className="text-center max-w-2xl mx-auto space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
                  <span>🔱 Adi Shankaracharya Virachitam</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold font-serif text-white">
                  अष्टादश महाशक्तिपीठ स्तोत्रम्
                </h3>
                <p className="text-xs sm:text-sm text-neutral-400">
                  Daily recitation of the 18 Supreme Maha Shakti Peethas with authentic Sanskrit verses and translations.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ASHTADASHA_STOTRAM.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 hover:border-amber-500/40 transition-all space-y-2 text-left"
                  >
                    <div className="flex items-center justify-between text-[11px] font-bold text-amber-500">
                      <span>Verse {idx + 1}</span>
                      <span className="text-neutral-400">{item.peetha}</span>
                    </div>
                    <p className="text-base font-serif font-bold text-amber-200 leading-relaxed">
                      {item.verse}
                    </p>
                    <p className="text-xs text-neutral-400 italic">
                      {item.transliteration}
                    </p>
                    <p className="text-xs text-neutral-300 pt-1 border-t border-neutral-800/80">
                      {item.meaning}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────
          4. EXPLORE WHAT SANATAN NEXT OFFERS (6 FEATURE CARDS)
          ───────────────────────────────────────────────────────── */}
      <section className="space-y-6 text-left">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Compass className="w-3.5 h-3.5" />
            <span>Comprehensive Cultural Platform</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white font-display">
            Explore What Sanatan Next Offers
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            Six dedicated knowledge pillars designed to explain the spiritual and scientific wisdom of Bharat.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {exploreFeatures.map(feat => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="p-6 rounded-3xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border border-neutral-200/90 dark:border-neutral-800/90 hover:border-amber-500/50 dark:hover:border-amber-500/50 shadow-xs hover:shadow-xl hover:shadow-amber-500/5 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-2xl bg-gradient-to-br ${feat.color} border shadow-xs group-hover:scale-105 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                      {feat.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-neutral-900 dark:text-white font-display group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      {feat.title}
                    </h3>
                    <span className="text-[11px] font-semibold text-amber-600/80 dark:text-amber-400/80 block">
                      {feat.tagline}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {feat.description}
                  </p>
                </div>

                <div className="pt-4 mt-2 border-t border-neutral-100 dark:border-neutral-800">
                  <a
                    href={SANATAN_NEXT_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-neutral-800 dark:text-neutral-200 hover:text-amber-600 dark:hover:text-amber-400 inline-flex items-center gap-1 group-hover:gap-1.5 transition-all"
                  >
                    <span>Explore on Sanatan Next</span>
                    <ExternalLink className="w-3.5 h-3.5 text-amber-500" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────
          5. PROJECT TRANSPARENCY & ARRJS ECOSYSTEM TREE MAP
          ───────────────────────────────────────────────────────── */}
      <section className="rounded-3xl bg-neutral-100/80 dark:bg-neutral-900/80 backdrop-blur-md border border-neutral-200/90 dark:border-neutral-800 p-6 sm:p-10 space-y-8 text-left">
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-200/70 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-semibold">
            <Code2 className="w-3.5 h-3.5 text-accent" />
            <span>PROJECT TRANSPARENCY & PHILOSOPHY</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white font-display">
            Built as an Independent Digital Project
          </h2>

          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Sanatan Next is developed as a separate project with its own standalone website and codebase. Both <strong>BharatUtility</strong> and <strong>Sanatan Next</strong> are initiatives under the <strong>ARRJS Technologies</strong> ecosystem.
          </p>
        </div>

        {/* Ecosystem Tree Map */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {/* Node 1: Parent Organization */}
          <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-accent">Parent Ecosystem</span>
            <h4 className="text-sm font-extrabold text-neutral-900 dark:text-white">
              ARRJS Technologies
            </h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Technology holding organization building modern digital products and utilities for India.
            </p>
            <a
              href={ARRJS_TECH_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-accent hover:underline inline-flex items-center gap-1 pt-1"
            >
              arrjs-technologies.netlify.app ↗
            </a>
          </div>

          {/* Node 2: BharatUtility (This Project) */}
          <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-indigo-500/30 dark:border-indigo-500/30 space-y-2 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Active Website</span>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-600">You Are Here</span>
            </div>
            <h4 className="text-sm font-extrabold text-neutral-900 dark:text-white">
              BharatUtility
            </h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              100% free everyday calculations, financial calculators, document suites, and civic utilities for India.
            </p>
            <span className="text-xs font-bold text-neutral-400 block pt-1">
              bharatutility.tech
            </span>
          </div>

          {/* Node 3: Sanatan Next (Promoted Platform) */}
          <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-amber-500/40 dark:border-amber-500/40 space-y-2 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Featured Initiative</span>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600">Standalone</span>
            </div>
            <h4 className="text-sm font-extrabold text-neutral-900 dark:text-white">
              Sanatan Next
            </h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Digital knowledge platform for Sanatan heritage, sacred geography, panchang, and traditions.
            </p>
            <a
              href={SANATAN_NEXT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1 pt-1"
            >
              sanatannext.netlify.app ↗
            </a>
          </div>
        </div>

        {/* Disclaimer statement */}
        <div className="max-w-3xl mx-auto p-4 rounded-2xl bg-white/70 dark:bg-neutral-900/70 border border-neutral-200/70 dark:border-neutral-800 text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed text-center">
          <p>
            <strong>Note on Independence:</strong> Sanatan Next is a free digital knowledge and cultural exploration project. It does not claim official religious organization, government affiliation, or temple trust authority. All content is designed for educational appreciation and cultural preservation.
          </p>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────
          6. FINAL DISCOVERY CTA BANNER
          ───────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white p-8 sm:p-12 shadow-lg text-center space-y-6">
        <div className="max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-200">
            Discover Sanatan Next
          </span>
          <h2 className="text-2xl sm:text-4xl font-black font-display tracking-tight">
            Ready to explore Indian heritage & traditions?
          </h2>
          <p className="text-sm text-amber-100 leading-relaxed">
            Visit the standalone Sanatan Next platform today to experience sacred geography guides, panchang tools, and traditional wisdom in one place.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <a
            href={SANATAN_NEXT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3.5 rounded-2xl bg-white text-neutral-900 hover:bg-neutral-100 font-extrabold text-sm sm:text-base shadow-lg hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-2"
          >
            <span>Launch Sanatan Next ↗</span>
          </a>

          <Link
            to="/tools"
            className="px-6 py-3.5 rounded-2xl bg-black/25 hover:bg-black/40 text-white border border-white/20 font-bold text-sm hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-2"
          >
            <span>Explore BharatUtility Tools</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
};
