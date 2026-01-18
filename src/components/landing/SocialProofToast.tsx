import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plane, ShoppingBag, Zap, CreditCard } from "lucide-react";

interface Notification {
  id: number;
  name: string;
  city: string;
  amount: number;
  company: string;
  category: "flight" | "ecommerce" | "energy" | "bank";
  timeAgo: string;
}

const categoryIcons = {
  flight: Plane,
  ecommerce: ShoppingBag,
  energy: Zap,
  bank: CreditCard,
};

const categoryColors = {
  flight: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  ecommerce: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
  energy: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
  bank: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
};

// Pool of realistic notifications
const notificationPool: Omit<Notification, "id" | "timeAgo">[] = [
  { name: "Marco R.", city: "Milano", amount: 450, company: "Ryanair", category: "flight" },
  { name: "Laura B.", city: "Roma", amount: 600, company: "Vueling", category: "flight" },
  { name: "Giuseppe M.", city: "Napoli", amount: 250, company: "EasyJet", category: "flight" },
  { name: "Francesca T.", city: "Torino", amount: 380, company: "Alitalia", category: "flight" },
  { name: "Alessandro C.", city: "Bologna", amount: 175, company: "Amazon", category: "ecommerce" },
  { name: "Chiara V.", city: "Firenze", amount: 89, company: "Zalando", category: "ecommerce" },
  { name: "Paolo S.", city: "Genova", amount: 320, company: "Enel", category: "energy" },
  { name: "Giulia D.", city: "Palermo", amount: 145, company: "Eni", category: "energy" },
  { name: "Matteo L.", city: "Bari", amount: 95, company: "N26", category: "bank" },
  { name: "Valentina P.", city: "Venezia", amount: 280, company: "Unicredit", category: "bank" },
  { name: "Stefano G.", city: "Verona", amount: 520, company: "Wizz Air", category: "flight" },
  { name: "Elena F.", city: "Catania", amount: 400, company: "Lufthansa", category: "flight" },
];

const timeAgoOptions = ["5 minuti fa", "12 minuti fa", "27 minuti fa", "1 ora fa", "2 ore fa"];

const SocialProofToast = () => {
  const [currentNotification, setCurrentNotification] = useState<Notification | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [notificationIndex, setNotificationIndex] = useState(0);

  useEffect(() => {
    // Don't show on mobile
    if (window.innerWidth < 768) return;
    
    // Check if user has dismissed recently
    const dismissed = sessionStorage.getItem("socialProofDismissed");
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    // Initial delay before first notification
    const initialDelay = setTimeout(() => {
      showNotification();
    }, 15000); // Show first one after 15 seconds

    return () => clearTimeout(initialDelay);
  }, []);

  useEffect(() => {
    if (isDismissed) return;

    // Show notifications periodically
    const interval = setInterval(() => {
      showNotification();
    }, 45000); // Every 45 seconds

    return () => clearInterval(interval);
  }, [isDismissed, notificationIndex]);

  const showNotification = () => {
    const notification = notificationPool[notificationIndex % notificationPool.length];
    const timeAgo = timeAgoOptions[Math.floor(Math.random() * timeAgoOptions.length)];
    
    setCurrentNotification({
      ...notification,
      id: Date.now(),
      timeAgo,
    });

    setNotificationIndex(prev => prev + 1);

    // Auto-hide after 6 seconds
    setTimeout(() => {
      setCurrentNotification(null);
    }, 6000);
  };

  const handleDismiss = () => {
    setCurrentNotification(null);
    setIsDismissed(true);
    sessionStorage.setItem("socialProofDismissed", "true");
  };

  if (isDismissed) return null;

  const Icon = currentNotification ? categoryIcons[currentNotification.category] : Plane;

  return (
    <AnimatePresence>
      {currentNotification && (
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-6 left-6 z-50 hidden md:block"
        >
          <div className="bg-card border border-border rounded-2xl p-4 shadow-2xl max-w-xs">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-xl ${categoryColors[currentNotification.category]}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">
                  {currentNotification.name} da {currentNotification.city}
                </p>
                <p className="text-sm text-muted-foreground">
                  ha recuperato{" "}
                  <span className="font-semibold text-primary">
                    €{currentNotification.amount}
                  </span>{" "}
                  da {currentNotification.company}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {currentNotification.timeAgo}
                </p>
              </div>
              <button
                onClick={handleDismiss}
                className="p-1 hover:bg-muted rounded-full transition-colors"
                aria-label="Chiudi"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SocialProofToast;
