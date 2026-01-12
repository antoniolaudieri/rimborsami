import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Bell,
  BellOff,
  Check,
  Clock,
  AlertCircle,
  Sparkles,
  Loader2,
  Trash2,
  ChevronRight,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string | null;
  read: boolean;
  action_url: string | null;
  created_at: string;
}

const typeIcons: Record<string, React.ReactNode> = {
  new_opportunity: <Sparkles className="w-5 h-5 text-primary" />,
  deadline: <Clock className="w-5 h-5 text-amber-500" />,
  reminder: <AlertCircle className="w-5 h-5 text-blue-500" />,
  system: <Bell className="w-5 h-5 text-muted-foreground" />,
};

export default function DashboardNotifications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);

      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user?.id)
        .eq('read', false);

      setNotifications(notifications.map(n => ({ ...n, read: true })));
      toast({
        title: 'Fatto!',
        description: 'Tutte le notifiche sono state segnate come lette',
      });
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      setNotifications(notifications.filter(n => n.id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
            Notifiche
            {unreadCount > 0 && (
              <Badge variant="destructive">{unreadCount} nuove</Badge>
            )}
          </h1>
          <p className="text-muted-foreground mt-1">
            Rimani aggiornato sulle tue opportunità
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={markAllAsRead}>
            <Check className="w-4 h-4 mr-2" />
            Segna tutte come lette
          </Button>
        )}
      </motion.div>

      {/* Notifications list */}
      {notifications.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardContent className="py-12 text-center">
              <BellOff className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nessuna notifica</h3>
              <p className="text-muted-foreground">
                Le notifiche sulle tue opportunità appariranno qui
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification, index) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card 
                className={`${notification.read ? 'opacity-60' : ''} ${notification.action_url ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
                onClick={() => {
                  if (notification.action_url) {
                    markAsRead(notification.id);
                    navigate(notification.action_url);
                  }
                }}
              >
                <CardContent className="py-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      {typeIcons[notification.type] || typeIcons.system}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold">
                            {notification.title}
                            {!notification.read && (
                              <span className="ml-2 inline-block w-2 h-2 rounded-full bg-primary" />
                            )}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {new Date(notification.created_at).toLocaleDateString('it-IT', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {notification.action_url && (
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
                        {!notification.read && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <Check className="w-3 h-3 mr-1" />
                            Segna come letta
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteNotification(notification.id)}
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Elimina
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
