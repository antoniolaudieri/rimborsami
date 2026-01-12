import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DeadlineCountdown from "@/components/opportunities/DeadlineCountdown";
import {
  ArrowRight,
  Euro,
  Users,
  Sparkles,
  Plane,
  ShoppingBag,
  Landmark,
  Shield,
  Smartphone,
  Zap,
  Train,
  Car,
  Laptop,
  Scale,
} from "lucide-react";

interface PublicOpportunity {
  id: string;
  title: string;
  category: string;
  short_description: string | null;
  min_amount: number | null;
  max_amount: number | null;
  deadline_days: number | null;
  created_at: string;
}

const categoryIcons: Record<string, React.ReactNode> = {
  flight: <Plane className="w-5 h-5" />,
  ecommerce: <ShoppingBag className="w-5 h-5" />,
  bank: <Landmark className="w-5 h-5" />,
  insurance: <Shield className="w-5 h-5" />,
  telecom: <Smartphone className="w-5 h-5" />,
  energy: <Zap className="w-5 h-5" />,
  transport: <Train className="w-5 h-5" />,
  automotive: <Car className="w-5 h-5" />,
  tech: <Laptop className="w-5 h-5" />,
  class_action: <Scale className="w-5 h-5" />,
};

const categoryLabels: Record<string, string> = {
  flight: "Voli",
  ecommerce: "E-commerce",
  bank: "Banche",
  insurance: "Assicurazioni",
  warranty: "Garanzia",
  telecom: "Telecomunicazioni",
  energy: "Energia",
  transport: "Trasporti",
  automotive: "Auto",
  tech: "Tech/Privacy",
  class_action: "Class Action",
  other: "Altro",
};

export default function Opportunities() {
  const [opportunities, setOpportunities] = useState<PublicOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    try {
      const { data, error } = await supabase
        .from("opportunities")
        .select("id, title, category, short_description, min_amount, max_amount, deadline_days, created_at")
        .eq("active", true)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setOpportunities(data || []);
    } catch (error) {
      console.error("Error fetching opportunities:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOpportunities = opportunities.filter((opp) => {
    if (activeTab === "all") return true;
    return opp.category === activeTab;
  });

  // Calculate deadline from deadline_days
  const getDeadlineDate = (days: number | null) => {
    if (!days) return null;
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-20">
        <div className="container">
          {/* Hero section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Users className="w-3.5 h-3.5 mr-1.5" />
              Oltre 127.000 utenti attivi
            </Badge>
            <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">
              Opportunità di <span className="text-gradient-hero">rimborso</span> attive
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Scopri i rimborsi, le compensazioni e le class action a cui potresti avere diritto.
              Registrati per verificare la tua eligibilità.
            </p>
            <Button variant="hero" size="xl" className="group" asChild>
              <Link to="/auth?mode=signup">
                Verifica la tua eligibilità
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </motion.div>

          {/* Filters */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="flex flex-wrap h-auto gap-1 p-1 justify-center">
              <TabsTrigger value="all">Tutte</TabsTrigger>
              <TabsTrigger value="class_action">Class Action</TabsTrigger>
              <TabsTrigger value="flight">Voli</TabsTrigger>
              <TabsTrigger value="bank">Banche</TabsTrigger>
              <TabsTrigger value="telecom">Telecomunicazioni</TabsTrigger>
              <TabsTrigger value="energy">Energia</TabsTrigger>
              <TabsTrigger value="tech">Tech/Privacy</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Opportunities grid */}
          <TabsContent value={activeTab}>
            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-6 bg-muted rounded w-3/4 mb-3" />
                      <div className="h-4 bg-muted rounded w-full mb-2" />
                      <div className="h-4 bg-muted rounded w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredOpportunities.map((opp, index) => (
                  <motion.div
                    key={opp.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="h-full hover:shadow-lg hover:border-primary/30 transition-all group">
                      <CardContent className="p-6 flex flex-col h-full">
                        {/* Category badge */}
                        <div className="flex items-center justify-between mb-4">
                          <Badge variant="secondary" className="flex items-center gap-1.5">
                            {categoryIcons[opp.category] || <Sparkles className="w-4 h-4" />}
                            {categoryLabels[opp.category]}
                          </Badge>
                          {opp.deadline_days && opp.deadline_days <= 30 && (
                            <DeadlineCountdown 
                              deadline={getDeadlineDate(opp.deadline_days)} 
                              compact 
                            />
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="font-display text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                          {opp.title}
                        </h3>

                        {/* Description */}
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
                          {opp.short_description || "Scopri se hai diritto a questo rimborso registrandoti gratuitamente."}
                        </p>

                        {/* Amount and CTA */}
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                          <div className="flex items-center gap-1.5 text-primary font-semibold">
                            <Euro className="w-4 h-4" />
                            {opp.min_amount && opp.max_amount ? (
                              <span>
                                {opp.min_amount.toLocaleString('it-IT')} - {opp.max_amount.toLocaleString('it-IT')}
                              </span>
                            ) : (
                              <span>Variabile</span>
                            )}
                          </div>
                          <Button size="sm" variant="ghost" className="group-hover:bg-primary group-hover:text-white" asChild>
                            <Link to="/auth?mode=signup">
                              Verifica
                              <ArrowRight className="w-4 h-4 ml-1" />
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* CTA section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <Card className="bg-gradient-hero text-white max-w-2xl mx-auto">
              <CardContent className="py-10 px-6">
                <Sparkles className="w-10 h-10 mx-auto mb-4 text-white/80" />
                <h3 className="font-display text-2xl font-bold mb-3">
                  Non sai se hai diritto a un rimborso?
                </h3>
                <p className="text-white/80 mb-6 max-w-md mx-auto">
                  Rispondi al nostro quiz di 2 minuti e scopri automaticamente tutte le opportunità 
                  di rimborso a cui hai diritto.
                </p>
                <Button size="lg" variant="secondary" className="group" asChild>
                  <Link to="/auth?mode=signup">
                    Inizia il quiz gratuito
                    <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
