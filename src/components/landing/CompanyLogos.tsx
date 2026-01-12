import { motion } from "framer-motion";

// Import real logos
import ryanairLogo from "@/assets/logos/ryanair.svg";
import easyjetLogo from "@/assets/logos/easyjet.svg";
import lufthansaLogo from "@/assets/logos/lufthansa.svg";
import vodafoneLogo from "@/assets/logos/vodafone.svg";
import googleLogo from "@/assets/logos/google.svg";
import appleLogo from "@/assets/logos/apple.svg";
import metaLogo from "@/assets/logos/meta.svg";
import zalandoLogo from "@/assets/logos/zalando.svg";
import netflixLogo from "@/assets/logos/netflix.svg";
import spotifyLogo from "@/assets/logos/spotify.svg";
import airbnbLogo from "@/assets/logos/airbnb.svg";
import paypalLogo from "@/assets/logos/paypal.svg";
import aliexpressLogo from "@/assets/logos/aliexpress.svg";
import uberLogo from "@/assets/logos/uber.svg";
import bookingLogo from "@/assets/logos/booking.svg";
import revolutLogo from "@/assets/logos/revolut.svg";
import n26Logo from "@/assets/logos/n26.svg";
import ebayLogo from "@/assets/logos/ebay.svg";
import samsungLogo from "@/assets/logos/samsung.svg";

const companies = [
  { name: "Ryanair", logo: ryanairLogo },
  { name: "easyJet", logo: easyjetLogo },
  { name: "Lufthansa", logo: lufthansaLogo },
  { name: "Vodafone", logo: vodafoneLogo },
  { name: "Google", logo: googleLogo },
  { name: "Apple", logo: appleLogo },
  { name: "Meta", logo: metaLogo },
  { name: "Zalando", logo: zalandoLogo },
  { name: "Netflix", logo: netflixLogo },
  { name: "Spotify", logo: spotifyLogo },
  { name: "Airbnb", logo: airbnbLogo },
  { name: "PayPal", logo: paypalLogo },
  { name: "AliExpress", logo: aliexpressLogo },
  { name: "Uber", logo: uberLogo },
  { name: "Booking", logo: bookingLogo },
  { name: "Revolut", logo: revolutLogo },
  { name: "N26", logo: n26Logo },
  { name: "eBay", logo: ebayLogo },
  { name: "Samsung", logo: samsungLogo },
];

const CompanyLogos = () => {
  return (
    <section className="py-16 bg-background overflow-hidden">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="font-display text-xl sm:text-2xl font-semibold text-muted-foreground">
            Queste aziende potrebbero <span className="text-foreground">doverti soldi</span>
          </h2>
        </motion.div>

        {/* Infinite scroll carousel */}
        <div className="relative">
          <div className="flex gap-6 animate-scroll">
            {[...companies, ...companies].map((company, index) => (
              <div
                key={`${company.name}-${index}`}
                className="flex-shrink-0 flex flex-col items-center justify-center gap-3 px-6 py-4 rounded-xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all group cursor-pointer min-w-[130px] h-[100px]"
              >
                <img 
                  src={company.logo} 
                  alt={`${company.name} logo`}
                  className="h-8 w-auto max-w-[80px] object-contain opacity-60 group-hover:opacity-100 transition-opacity duration-300"
                  loading="lazy"
                />
                <span className="text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors whitespace-nowrap">
                  {company.name}
                </span>
              </div>
            ))}
          </div>
          
          {/* Fade edges */}
          <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-background to-transparent pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-background to-transparent pointer-events-none" />
        </div>
      </div>

      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          animation: scroll 40s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
};

export default CompanyLogos;
