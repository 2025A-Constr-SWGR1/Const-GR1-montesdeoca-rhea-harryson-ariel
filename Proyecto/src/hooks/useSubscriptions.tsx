
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { SubscriptionPlan, UserSubscription } from '@/types/subscription';

export const useSubscriptions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
    if (user) {
      fetchUserSubscription();
    }
  }, [user]);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price');

      if (error) throw error;
      
      // Transform the data to match our interfaces
      const transformedPlans: SubscriptionPlan[] = (data || []).map(plan => ({
        id: plan.id,
        name: plan.name,
        price: plan.price,
        precio_casillero: plan.precio_casillero,
        benefits: typeof plan.benefits === 'object' ? plan.benefits as Record<string, any> : {},
        discounts: Array.isArray(plan.discounts) ? plan.discounts as Array<{ nombre: string; descuento: number }> : []
      }));
      
      setPlans(transformedPlans);
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los planes",
        variant: "destructive"
      });
    }
  };

  const fetchUserSubscription = async () => {
    if (!user) return;

    try {
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single();

      if (!userData) return;

      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*, subscription_plans(*)')
        .eq('user_id', userData.id)
        .eq('status', 'active')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        // Transform the data to match our interface
        const transformedSubscription: UserSubscription = {
          id: data.id,
          user_id: data.user_id,
          plan_id: data.plan_id,
          status: data.status,
          gratis_al_mes: typeof data.gratis_al_mes === 'object' && data.gratis_al_mes !== null ? data.gratis_al_mes as Record<string, any> : {},
          created_at: data.created_at,
          updated_at: data.updated_at
        };
        setUserSubscription(transformedSubscription);
      }
    } catch (error) {
      console.error('Error fetching user subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToPlan = async (planId: string) => {
    if (!user) return;

    try {
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single();

      if (!userData) throw new Error('Usuario no encontrado');

      // Deactivate current subscription if exists
      if (userSubscription) {
        await supabase
          .from('user_subscriptions')
          .update({ status: 'inactive' })
          .eq('id', userSubscription.id);
      }

      // Create new subscription
      const { data, error } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: userData.id,
          plan_id: planId,
          status: 'active',
          gratis_al_mes: {}
        })
        .select()
        .single();

      if (error) throw error;

      // Update user as contributor
      await supabase
        .from('users')
        .update({ 
          es_aportante: true,
          tipo_aportacion: plans.find(p => p.id === planId)?.name 
        })
        .eq('id', userData.id);

      toast({
        title: "¡Suscripción exitosa!",
        description: "Ya eres parte del plan seleccionado"
      });

      fetchUserSubscription();
    } catch (error) {
      console.error('Error subscribing to plan:', error);
      toast({
        title: "Error",
        description: "No se pudo procesar la suscripción",
        variant: "destructive"
      });
    }
  };

  return {
    plans,
    userSubscription,
    loading,
    subscribeToPlan,
    refreshSubscription: fetchUserSubscription
  };
};
