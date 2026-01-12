import { useState } from 'react';
import {
  Plane,
  ShoppingCart,
  Landmark,
  Shield,
  Package,
  FileQuestion,
  Phone,
  Zap,
  Train,
  Car,
  Smartphone,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Database di loghi aziendali comuni italiane e internazionali
const companyLogos: Record<string, string> = {
  // ========== VOLI ==========
  'ryanair': 'https://logo.clearbit.com/ryanair.com',
  'easyjet': 'https://logo.clearbit.com/easyjet.com',
  'ita airways': 'https://logo.clearbit.com/ita-airways.com',
  'ita': 'https://logo.clearbit.com/ita-airways.com',
  'alitalia': 'https://logo.clearbit.com/alitalia.com',
  'vueling': 'https://logo.clearbit.com/vueling.com',
  'wizz air': 'https://logo.clearbit.com/wizzair.com',
  'wizzair': 'https://logo.clearbit.com/wizzair.com',
  'wizz': 'https://logo.clearbit.com/wizzair.com',
  'lufthansa': 'https://logo.clearbit.com/lufthansa.com',
  'air france': 'https://logo.clearbit.com/airfrance.com',
  'british airways': 'https://logo.clearbit.com/britishairways.com',
  'emirates': 'https://logo.clearbit.com/emirates.com',
  'qatar airways': 'https://logo.clearbit.com/qatarairways.com',
  'turkish airlines': 'https://logo.clearbit.com/turkishairlines.com',
  'volotea': 'https://logo.clearbit.com/volotea.com',
  'neos': 'https://logo.clearbit.com/neosair.it',
  'air dolomiti': 'https://logo.clearbit.com/airdolomiti.it',
  'blue air': 'https://logo.clearbit.com/blueairweb.com',
  'air europa': 'https://logo.clearbit.com/aireuropa.com',
  'iberia': 'https://logo.clearbit.com/iberia.com',
  'klm': 'https://logo.clearbit.com/klm.com',
  'tap portugal': 'https://logo.clearbit.com/flytap.com',
  'swiss': 'https://logo.clearbit.com/swiss.com',
  'austrian': 'https://logo.clearbit.com/austrian.com',
  'norwegian': 'https://logo.clearbit.com/norwegian.com',
  'aegean': 'https://logo.clearbit.com/aegeanair.com',
  'flydubai': 'https://logo.clearbit.com/flydubai.com',
  'etihad': 'https://logo.clearbit.com/etihad.com',
  'singapore airlines': 'https://logo.clearbit.com/singaporeair.com',
  'cathay pacific': 'https://logo.clearbit.com/cathaypacific.com',
  'delta': 'https://logo.clearbit.com/delta.com',
  'united': 'https://logo.clearbit.com/united.com',
  'american airlines': 'https://logo.clearbit.com/aa.com',
  
  // ========== TRENI ==========
  'trenitalia': 'https://logo.clearbit.com/trenitalia.com',
  'italo': 'https://logo.clearbit.com/italotreno.it',
  'italo treno': 'https://logo.clearbit.com/italotreno.it',
  'trenord': 'https://logo.clearbit.com/trenord.it',
  'frecciarossa': 'https://logo.clearbit.com/trenitalia.com',
  'frecciargento': 'https://logo.clearbit.com/trenitalia.com',
  'frecciabianca': 'https://logo.clearbit.com/trenitalia.com',
  'thello': 'https://logo.clearbit.com/thello.com',
  'sncf': 'https://logo.clearbit.com/sncf.com',
  'tgv': 'https://logo.clearbit.com/sncf.com',
  'eurostar': 'https://logo.clearbit.com/eurostar.com',
  'flixbus': 'https://logo.clearbit.com/flixbus.it',
  'flixbus italia': 'https://logo.clearbit.com/flixbus.it',
  
  // ========== BANCHE ==========
  'unicredit': 'https://logo.clearbit.com/unicredit.it',
  'intesa sanpaolo': 'https://logo.clearbit.com/intesasanpaolo.com',
  'intesa': 'https://logo.clearbit.com/intesasanpaolo.com',
  'bnl': 'https://logo.clearbit.com/bnl.it',
  'bnl bnp paribas': 'https://logo.clearbit.com/bnl.it',
  'n26': 'https://logo.clearbit.com/n26.com',
  'revolut': 'https://logo.clearbit.com/revolut.com',
  'fineco': 'https://logo.clearbit.com/fineco.it',
  'finecobank': 'https://logo.clearbit.com/fineco.it',
  'ing': 'https://logo.clearbit.com/ing.it',
  'ing direct': 'https://logo.clearbit.com/ing.it',
  'banca mediolanum': 'https://logo.clearbit.com/bancamediolanum.it',
  'mediolanum': 'https://logo.clearbit.com/bancamediolanum.it',
  'bper': 'https://logo.clearbit.com/bper.it',
  'bper banca': 'https://logo.clearbit.com/bper.it',
  'banco bpm': 'https://logo.clearbit.com/bancobpm.it',
  'bpm': 'https://logo.clearbit.com/bancobpm.it',
  'credem': 'https://logo.clearbit.com/credem.it',
  'mps': 'https://logo.clearbit.com/mps.it',
  'monte dei paschi': 'https://logo.clearbit.com/mps.it',
  'monte paschi': 'https://logo.clearbit.com/mps.it',
  'poste italiane': 'https://logo.clearbit.com/poste.it',
  'postepay': 'https://logo.clearbit.com/postepay.it',
  'bancoposta': 'https://logo.clearbit.com/poste.it',
  'wise': 'https://logo.clearbit.com/wise.com',
  'transferwise': 'https://logo.clearbit.com/wise.com',
  'hype': 'https://logo.clearbit.com/hype.it',
  'buddybank': 'https://logo.clearbit.com/buddybank.com',
  'widiba': 'https://logo.clearbit.com/widiba.it',
  'webank': 'https://logo.clearbit.com/webank.it',
  'chebanca': 'https://logo.clearbit.com/chebanca.it',
  'illimity': 'https://logo.clearbit.com/illimity.com',
  'banca sella': 'https://logo.clearbit.com/sella.it',
  'sella': 'https://logo.clearbit.com/sella.it',
  'ubi banca': 'https://logo.clearbit.com/ubibanca.it',
  'credit agricole': 'https://logo.clearbit.com/credit-agricole.it',
  'cariparma': 'https://logo.clearbit.com/credit-agricole.it',
  'deutsche bank': 'https://logo.clearbit.com/db.com',
  'bnp paribas': 'https://logo.clearbit.com/bnpparibas.com',
  'paypal': 'https://logo.clearbit.com/paypal.com',
  'satispay': 'https://logo.clearbit.com/satispay.com',
  'nexi': 'https://logo.clearbit.com/nexi.it',
  'american express': 'https://logo.clearbit.com/americanexpress.com',
  'amex': 'https://logo.clearbit.com/americanexpress.com',
  'mastercard': 'https://logo.clearbit.com/mastercard.com',
  'visa': 'https://logo.clearbit.com/visa.com',
  'klarna': 'https://logo.clearbit.com/klarna.com',
  'scalapay': 'https://logo.clearbit.com/scalapay.com',
  
  // ========== TELECOM ==========
  'tim': 'https://logo.clearbit.com/tim.it',
  'telecom italia': 'https://logo.clearbit.com/tim.it',
  'vodafone': 'https://logo.clearbit.com/vodafone.it',
  'windtre': 'https://logo.clearbit.com/windtre.it',
  'wind tre': 'https://logo.clearbit.com/windtre.it',
  'wind': 'https://logo.clearbit.com/windtre.it',
  'tre': 'https://logo.clearbit.com/windtre.it',
  'iliad': 'https://logo.clearbit.com/iliad.it',
  'fastweb': 'https://logo.clearbit.com/fastweb.it',
  'ho mobile': 'https://logo.clearbit.com/ho-mobile.it',
  'ho.': 'https://logo.clearbit.com/ho-mobile.it',
  'kena mobile': 'https://logo.clearbit.com/kenamobile.it',
  'kena': 'https://logo.clearbit.com/kenamobile.it',
  'poste mobile': 'https://logo.clearbit.com/postemobile.it',
  'postemobile': 'https://logo.clearbit.com/postemobile.it',
  'very mobile': 'https://logo.clearbit.com/verymobile.it',
  'very': 'https://logo.clearbit.com/verymobile.it',
  'sky': 'https://logo.clearbit.com/sky.it',
  'sky italia': 'https://logo.clearbit.com/sky.it',
  'dazn': 'https://logo.clearbit.com/dazn.com',
  'tiscali': 'https://logo.clearbit.com/tiscali.it',
  'linkem': 'https://logo.clearbit.com/linkem.com',
  'eolo': 'https://logo.clearbit.com/eolo.it',
  'coop voce': 'https://logo.clearbit.com/coopvoce.it',
  'coopvoce': 'https://logo.clearbit.com/coopvoce.it',
  'lycamobile': 'https://logo.clearbit.com/lycamobile.it',
  'spusu': 'https://logo.clearbit.com/spusu.it',
  
  // ========== ENERGIA ==========
  'enel': 'https://logo.clearbit.com/enel.it',
  'enel energia': 'https://logo.clearbit.com/enel.it',
  'enel x': 'https://logo.clearbit.com/enelx.com',
  'eni': 'https://logo.clearbit.com/eni.com',
  'eni plenitude': 'https://logo.clearbit.com/eni.com',
  'plenitude': 'https://logo.clearbit.com/eni.com',
  'a2a': 'https://logo.clearbit.com/a2a.eu',
  'a2a energia': 'https://logo.clearbit.com/a2a.eu',
  'edison': 'https://logo.clearbit.com/edison.it',
  'sorgenia': 'https://logo.clearbit.com/sorgenia.it',
  'hera': 'https://logo.clearbit.com/gruppohera.it',
  'iren': 'https://logo.clearbit.com/irenlucegas.it',
  'iren luce gas': 'https://logo.clearbit.com/irenlucegas.it',
  'acea': 'https://logo.clearbit.com/acea.it',
  'acea energia': 'https://logo.clearbit.com/acea.it',
  'engie': 'https://logo.clearbit.com/engie.it',
  'illumia': 'https://logo.clearbit.com/illumia.it',
  'wekiwi': 'https://logo.clearbit.com/wekiwi.it',
  'optima': 'https://logo.clearbit.com/optimaitalia.com',
  'optima italia': 'https://logo.clearbit.com/optimaitalia.com',
  'axpo': 'https://logo.clearbit.com/axpo.com',
  'duferco': 'https://logo.clearbit.com/duferco.com',
  'green network': 'https://logo.clearbit.com/greennetwork.it',
  
  // ========== E-COMMERCE ==========
  'amazon': 'https://logo.clearbit.com/amazon.it',
  'amazon prime': 'https://logo.clearbit.com/amazon.it',
  'ebay': 'https://logo.clearbit.com/ebay.it',
  'zalando': 'https://logo.clearbit.com/zalando.it',
  'mediaworld': 'https://logo.clearbit.com/mediaworld.it',
  'unieuro': 'https://logo.clearbit.com/unieuro.it',
  'euronics': 'https://logo.clearbit.com/euronics.it',
  'esselunga': 'https://logo.clearbit.com/esselunga.it',
  'carrefour': 'https://logo.clearbit.com/carrefour.it',
  'lidl': 'https://logo.clearbit.com/lidl.it',
  'aldi': 'https://logo.clearbit.com/aldi.it',
  'coop': 'https://logo.clearbit.com/e-coop.it',
  'conad': 'https://logo.clearbit.com/conad.it',
  'despar': 'https://logo.clearbit.com/despar.it',
  'penny market': 'https://logo.clearbit.com/penny.it',
  'md discount': 'https://logo.clearbit.com/md-spa.it',
  'shein': 'https://logo.clearbit.com/shein.com',
  'temu': 'https://logo.clearbit.com/temu.com',
  'aliexpress': 'https://logo.clearbit.com/aliexpress.com',
  'wish': 'https://logo.clearbit.com/wish.com',
  'asos': 'https://logo.clearbit.com/asos.com',
  'h&m': 'https://logo.clearbit.com/hm.com',
  'zara': 'https://logo.clearbit.com/zara.com',
  'decathlon': 'https://logo.clearbit.com/decathlon.it',
  'ikea': 'https://logo.clearbit.com/ikea.com',
  'leroy merlin': 'https://logo.clearbit.com/leroymerlin.it',
  'brico': 'https://logo.clearbit.com/bfrioperty.it',
  'eprice': 'https://logo.clearbit.com/eprice.it',
  'monclick': 'https://logo.clearbit.com/monclick.it',
  'yoox': 'https://logo.clearbit.com/yoox.com',
  'privalia': 'https://logo.clearbit.com/privalia.com',
  'veepee': 'https://logo.clearbit.com/veepee.it',
  'groupon': 'https://logo.clearbit.com/groupon.it',
  'booking': 'https://logo.clearbit.com/booking.com',
  'booking.com': 'https://logo.clearbit.com/booking.com',
  'expedia': 'https://logo.clearbit.com/expedia.it',
  'airbnb': 'https://logo.clearbit.com/airbnb.com',
  'trivago': 'https://logo.clearbit.com/trivago.it',
  'edreams': 'https://logo.clearbit.com/edreams.it',
  'volagratis': 'https://logo.clearbit.com/volagratis.com',
  'lastminute': 'https://logo.clearbit.com/lastminute.com',
  'just eat': 'https://logo.clearbit.com/justeat.it',
  'justeat': 'https://logo.clearbit.com/justeat.it',
  'deliveroo': 'https://logo.clearbit.com/deliveroo.it',
  'glovo': 'https://logo.clearbit.com/glovoapp.com',
  'uber eats': 'https://logo.clearbit.com/ubereats.com',
  
  // ========== AUTO ==========
  'fiat': 'https://logo.clearbit.com/fiat.com',
  'stellantis': 'https://logo.clearbit.com/stellantis.com',
  'alfa romeo': 'https://logo.clearbit.com/alfaromeo.com',
  'jeep': 'https://logo.clearbit.com/jeep.com',
  'lancia': 'https://logo.clearbit.com/lancia.com',
  'maserati': 'https://logo.clearbit.com/maserati.com',
  'ferrari': 'https://logo.clearbit.com/ferrari.com',
  'lamborghini': 'https://logo.clearbit.com/lamborghini.com',
  'citroen': 'https://logo.clearbit.com/citroen.it',
  'citroën': 'https://logo.clearbit.com/citroen.it',
  'peugeot': 'https://logo.clearbit.com/peugeot.it',
  'opel': 'https://logo.clearbit.com/opel.it',
  'volkswagen': 'https://logo.clearbit.com/volkswagen.it',
  'vw': 'https://logo.clearbit.com/volkswagen.it',
  'audi': 'https://logo.clearbit.com/audi.it',
  'bmw': 'https://logo.clearbit.com/bmw.it',
  'mercedes': 'https://logo.clearbit.com/mercedes-benz.it',
  'mercedes-benz': 'https://logo.clearbit.com/mercedes-benz.it',
  'toyota': 'https://logo.clearbit.com/toyota.it',
  'lexus': 'https://logo.clearbit.com/lexus.it',
  'renault': 'https://logo.clearbit.com/renault.it',
  'dacia': 'https://logo.clearbit.com/dacia.it',
  'ford': 'https://logo.clearbit.com/ford.it',
  'hyundai': 'https://logo.clearbit.com/hyundai.it',
  'kia': 'https://logo.clearbit.com/kia.it',
  'nissan': 'https://logo.clearbit.com/nissan.it',
  'mazda': 'https://logo.clearbit.com/mazda.it',
  'honda': 'https://logo.clearbit.com/honda.it',
  'suzuki': 'https://logo.clearbit.com/suzuki.it',
  'mitsubishi': 'https://logo.clearbit.com/mitsubishi-motors.it',
  'volvo': 'https://logo.clearbit.com/volvocars.com',
  'skoda': 'https://logo.clearbit.com/skoda-auto.it',
  'seat': 'https://logo.clearbit.com/seat.it',
  'cupra': 'https://logo.clearbit.com/cupraofficial.it',
  'mini': 'https://logo.clearbit.com/mini.it',
  'smart': 'https://logo.clearbit.com/smart.com',
  'tesla': 'https://logo.clearbit.com/tesla.com',
  'porsche': 'https://logo.clearbit.com/porsche.com',
  'land rover': 'https://logo.clearbit.com/landrover.it',
  'jaguar': 'https://logo.clearbit.com/jaguar.it',
  'subaru': 'https://logo.clearbit.com/subaru.it',
  'mg': 'https://logo.clearbit.com/mgmotor.eu',
  'dr': 'https://logo.clearbit.com/drmotorgroup.com',
  
  // ========== ASSICURAZIONI ==========
  'generali': 'https://logo.clearbit.com/generali.it',
  'allianz': 'https://logo.clearbit.com/allianz.it',
  'unipol': 'https://logo.clearbit.com/unipolsai.it',
  'unipolsai': 'https://logo.clearbit.com/unipolsai.it',
  'axa': 'https://logo.clearbit.com/axa.it',
  'zurich': 'https://logo.clearbit.com/zurich.it',
  'cattolica': 'https://logo.clearbit.com/cattolica.it',
  'vittoria': 'https://logo.clearbit.com/vittoriaassicurazioni.it',
  'vittoria assicurazioni': 'https://logo.clearbit.com/vittoriaassicurazioni.it',
  'sara': 'https://logo.clearbit.com/sara.it',
  'sara assicurazioni': 'https://logo.clearbit.com/sara.it',
  'linear': 'https://logo.clearbit.com/linear.it',
  'prima': 'https://logo.clearbit.com/prima.it',
  'prima assicurazioni': 'https://logo.clearbit.com/prima.it',
  'verti': 'https://logo.clearbit.com/verti.it',
  'quixa': 'https://logo.clearbit.com/quixa.it',
  'directline': 'https://logo.clearbit.com/directline.it',
  'direct line': 'https://logo.clearbit.com/directline.it',
  'genialloyd': 'https://logo.clearbit.com/genialloyd.it',
  'helvetia': 'https://logo.clearbit.com/helvetia.it',
  'groupama': 'https://logo.clearbit.com/groupama.it',
  'reale mutua': 'https://logo.clearbit.com/realemutua.it',
  'italiana assicurazioni': 'https://logo.clearbit.com/italiana.it',
  'poste assicura': 'https://logo.clearbit.com/poste.it',
  
  // ========== TECH ==========
  'google': 'https://logo.clearbit.com/google.com',
  'alphabet': 'https://logo.clearbit.com/abc.xyz',
  'apple': 'https://logo.clearbit.com/apple.com',
  'meta': 'https://logo.clearbit.com/meta.com',
  'facebook': 'https://logo.clearbit.com/facebook.com',
  'instagram': 'https://logo.clearbit.com/instagram.com',
  'whatsapp': 'https://logo.clearbit.com/whatsapp.com',
  'tiktok': 'https://logo.clearbit.com/tiktok.com',
  'bytedance': 'https://logo.clearbit.com/bytedance.com',
  'linkedin': 'https://logo.clearbit.com/linkedin.com',
  'twitter': 'https://logo.clearbit.com/twitter.com',
  'x': 'https://logo.clearbit.com/x.com',
  'spotify': 'https://logo.clearbit.com/spotify.com',
  'netflix': 'https://logo.clearbit.com/netflix.com',
  'disney+': 'https://logo.clearbit.com/disneyplus.com',
  'disney plus': 'https://logo.clearbit.com/disneyplus.com',
  'prime video': 'https://logo.clearbit.com/primevideo.com',
  'youtube': 'https://logo.clearbit.com/youtube.com',
  'twitch': 'https://logo.clearbit.com/twitch.tv',
  'microsoft': 'https://logo.clearbit.com/microsoft.com',
  'windows': 'https://logo.clearbit.com/microsoft.com',
  'xbox': 'https://logo.clearbit.com/xbox.com',
  'playstation': 'https://logo.clearbit.com/playstation.com',
  'sony': 'https://logo.clearbit.com/sony.com',
  'nintendo': 'https://logo.clearbit.com/nintendo.com',
  'samsung': 'https://logo.clearbit.com/samsung.com',
  'xiaomi': 'https://logo.clearbit.com/xiaomi.com',
  'huawei': 'https://logo.clearbit.com/huawei.com',
  'oppo': 'https://logo.clearbit.com/oppo.com',
  'realme': 'https://logo.clearbit.com/realme.com',
  'oneplus': 'https://logo.clearbit.com/oneplus.com',
  'motorola': 'https://logo.clearbit.com/motorola.com',
  'lg': 'https://logo.clearbit.com/lg.com',
  'asus': 'https://logo.clearbit.com/asus.com',
  'lenovo': 'https://logo.clearbit.com/lenovo.com',
  'hp': 'https://logo.clearbit.com/hp.com',
  'dell': 'https://logo.clearbit.com/dell.com',
  'acer': 'https://logo.clearbit.com/acer.com',
  'nvidia': 'https://logo.clearbit.com/nvidia.com',
  'amd': 'https://logo.clearbit.com/amd.com',
  'intel': 'https://logo.clearbit.com/intel.com',
  'openai': 'https://logo.clearbit.com/openai.com',
  'chatgpt': 'https://logo.clearbit.com/openai.com',
  'dropbox': 'https://logo.clearbit.com/dropbox.com',
  'zoom': 'https://logo.clearbit.com/zoom.us',
  'slack': 'https://logo.clearbit.com/slack.com',
  'telegram': 'https://logo.clearbit.com/telegram.org',
  'uber': 'https://logo.clearbit.com/uber.com',
  
  // ========== CLASS ACTION / ORGANIZZATORI ==========
  'altroconsumo': 'https://logo.clearbit.com/altroconsumo.it',
  'codacons': 'https://logo.clearbit.com/codacons.it',
  'adiconsum': 'https://logo.clearbit.com/adiconsum.it',
  'federconsumatori': 'https://logo.clearbit.com/federconsumatori.it',
  'unione consumatori': 'https://logo.clearbit.com/consumatori.it',
  'adusbef': 'https://logo.clearbit.com/adusbef.it',
  'confconsumatori': 'https://logo.clearbit.com/confconsumatori.it',
  'movimento consumatori': 'https://logo.clearbit.com/movimentoconsumatori.it',
  'assoutenti': 'https://logo.clearbit.com/assoutenti.it',
  'aduc': 'https://logo.clearbit.com/aduc.it',
  'cittadinanzattiva': 'https://logo.clearbit.com/cittadinanzattiva.it',
  'lega consumatori': 'https://logo.clearbit.com/legaconsumatori.it',
  'mdc': 'https://logo.clearbit.com/movimentoconsumatori.it',
  
  // ========== SERVIZI PUBBLICI ==========
  'agenzia entrate': 'https://logo.clearbit.com/agenziaentrate.gov.it',
  'inps': 'https://logo.clearbit.com/inps.it',
  'inail': 'https://logo.clearbit.com/inail.it',
  'atm': 'https://logo.clearbit.com/atm.it',
  'atac': 'https://logo.clearbit.com/atac.roma.it',
  'amt': 'https://logo.clearbit.com/amt.genova.it',
  'gtt': 'https://logo.clearbit.com/gtt.to.it',
  'cotral': 'https://logo.clearbit.com/cotralspa.it',
};

// Icone categoria come fallback
const categoryIcons: Record<string, React.ReactNode> = {
  flight: <Plane className="w-full h-full" />,
  ecommerce: <ShoppingCart className="w-full h-full" />,
  bank: <Landmark className="w-full h-full" />,
  insurance: <Shield className="w-full h-full" />,
  warranty: <Package className="w-full h-full" />,
  telecom: <Phone className="w-full h-full" />,
  energy: <Zap className="w-full h-full" />,
  transport: <Train className="w-full h-full" />,
  automotive: <Car className="w-full h-full" />,
  tech: <Smartphone className="w-full h-full" />,
  class_action: <Users className="w-full h-full" />,
  other: <FileQuestion className="w-full h-full" />,
};

// Campi possibili dove cercare il nome azienda
const companyFields = [
  'compagnia',
  'azienda', 
  'fornitore',
  'venditore',
  'banca',
  'operatore',
  'compagnia_aerea',
  'vettore',
  'assicurazione',
  'gestore',
  'brand',
  'negozio',
  'sito',
  'shop',
];

// Escape caratteri speciali per regex
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Nomi troppo corti che causano falsi positivi - escludi dalla ricerca nel titolo
const shortNamesToExclude = ['ita', 'tre', 'x', 'lg', 'hp', 'mg', 'dr', 'vw', 'axa', 'ing', 'a2a', 'mps', 'bnl', 'sky', 'ho.', 'amt', 'gtt', 'bpm'];

function extractCompanyName(matchedData?: Record<string, unknown>, opportunityTitle?: string): string | null {
  // Prima cerca nei matchedData
  if (matchedData) {
    for (const field of companyFields) {
      const value = matchedData[field];
      if (value && typeof value === 'string' && value.trim()) {
        return value.trim().toLowerCase();
      }
    }
    
    // Cerca anche in campi con nomi simili
    for (const [key, value] of Object.entries(matchedData)) {
      if (typeof value === 'string' && value.trim()) {
        const keyLower = key.toLowerCase();
        if (companyFields.some(f => keyLower.includes(f))) {
          return value.trim().toLowerCase();
        }
      }
    }
  }
  
  // Se non trovato, prova a estrarre dal titolo dell'opportunità
  if (opportunityTitle) {
    const titleLower = opportunityTitle.toLowerCase();
    
    // Ordina le chiavi per lunghezza decrescente per matchare prima i nomi più specifici
    const sortedKeys = Object.keys(companyLogos)
      .filter(key => !shortNamesToExclude.includes(key)) // Escludi nomi troppo corti
      .filter(key => key.length >= 4) // Richiedi almeno 4 caratteri per evitare falsi positivi
      .sort((a, b) => b.length - a.length);
    
    // Cerca se il titolo contiene un nome azienda conosciuto (solo word boundary)
    for (const companyKey of sortedKeys) {
      const escapedKey = escapeRegExp(companyKey);
      // Usa word boundary per evitare match parziali
      const regex = new RegExp(`\\b${escapedKey}\\b`, 'i');
      if (regex.test(titleLower)) {
        return companyKey;
      }
    }
  }
  
  return null;
}

function findLogoUrl(companyName: string): string | null {
  // Match esatto
  if (companyLogos[companyName]) {
    return companyLogos[companyName];
  }
  
  // Match parziale
  for (const [key, url] of Object.entries(companyLogos)) {
    if (companyName.includes(key) || key.includes(companyName)) {
      return url;
    }
  }
  
  return null;
}

interface CompanyLogoProps {
  category: string;
  matchedData?: Record<string, unknown>;
  opportunityTitle?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-10 h-10',
  md: 'w-12 h-12',
  lg: 'w-14 h-14',
};

const iconSizeClasses = {
  sm: 'w-5 h-5',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

export function CompanyLogo({ 
  category, 
  matchedData, 
  opportunityTitle,
  size = 'md',
  className 
}: CompanyLogoProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const companyName = extractCompanyName(matchedData, opportunityTitle);
  const logoUrl = companyName ? findLogoUrl(companyName) : null;
  
  // Debug log
  console.log('CompanyLogo render:', { opportunityTitle, companyName, logoUrl, imageError });
  
  const showLogo = logoUrl && !imageError;
  
  // Genera iniziali per fallback colorato
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  
  // Genera colore basato sul nome
  const getColorFromName = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return `hsl(${hue}, 65%, 45%)`;
  };
  
  return (
    <div 
      className={cn(
        "rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden",
        showLogo ? "bg-white p-1.5 border border-border/50" : "bg-primary/10 text-primary",
        sizeClasses[size],
        className
      )}
      style={companyName && !showLogo ? { backgroundColor: getColorFromName(companyName) } : undefined}
    >
      {showLogo ? (
        <img
          src={logoUrl}
          alt={companyName || 'Company logo'}
          className="w-full h-full object-contain rounded-lg"
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            console.log('CompanyLogo image error for:', logoUrl);
            setImageError(true);
          }}
          loading="lazy"
        />
      ) : companyName ? (
        // Fallback con iniziali colorate
        <span 
          className={cn(
            "font-bold text-white",
            size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'
          )}
        >
          {getInitials(companyName)}
        </span>
      ) : (
        <div className={iconSizeClasses[size]}>
          {categoryIcons[category] || categoryIcons.other}
        </div>
      )}
    </div>
  );
}
