
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';
import { Check, Star, Crown, Zap } from 'lucide-react';

const Subscriptions = () => {
  const { plans, userSubscription, loading, subscribeToPlan } = useSubscriptions();

  const getPlanIcon = (planName: string) => {
    switch (planName) {
      case 'AvoCloud': return <Zap className="h-6 w-6" />;
      case 'AvoTech': return <Star className="h-6 w-6" />;
      case 'Avocoder': return <Crown className="h-6 w-6" />;
      default: return <Check className="h-6 w-6" />;
    }
  };

  const getPlanColor = (planName: string) => {
    switch (planName) {
      case 'AvoCloud': return 'border-blue-200 bg-blue-50';
      case 'AvoTech': return 'border-purple-200 bg-purple-50';
      case 'Avocoder': return 'border-yellow-200 bg-yellow-50 ring-2 ring-yellow-300';
      default: return 'border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto py-6 px-4">
          <div className="text-center">Cargando planes...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Planes de Aportación</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Únete a AEIS y disfruta de beneficios exclusivos según tu plan de aportación
          </p>
        </div>

        {userSubscription && (
          <div className="mb-8">
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-center space-x-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span className="text-green-800 font-medium">
                    Plan actual: {userSubscription.status === 'active' ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const isCurrentPlan = userSubscription?.plan_id === plan.id;
            const benefits = Object.keys(plan.benefits || {});
            
            return (
              <Card 
                key={plan.id} 
                className={`relative transition-all hover:shadow-lg ${getPlanColor(plan.name)} ${
                  plan.name === 'Avocoder' ? 'scale-105' : ''
                }`}
              >
                {plan.name === 'Avocoder' && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-yellow-500 text-white px-3 py-1">
                      Más Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    {getPlanIcon(plan.name)}
                  </div>
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-primary">${plan.price}</span>
                    <span className="text-gray-600">/mes</span>
                  </div>
                  <div className="text-sm text-gray-600 mt-2">
                    Casillero: ${plan.precio_casillero}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Servicios Gratis al Mes:</h4>
                    <ul className="space-y-1">
                      {benefits.map((benefit) => (
                        <li key={benefit} className="flex items-center space-x-2 text-sm">
                          <Check className="h-4 w-4 text-green-500" />
                          <span className="capitalize">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Descuentos:</h4>
                    <ul className="space-y-1">
                      {plan.discounts?.slice(0, 3).map((discount, index) => (
                        <li key={index} className="flex items-center justify-between text-sm">
                          <span className="capitalize">{discount.nombre}</span>
                          <span className="text-green-600 font-medium">
                            {discount.descuento >= 1 ? 'Gratis' : `${(discount.descuento * 100).toFixed(0)}% off`}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button 
                    className="w-full mt-6" 
                    disabled={isCurrentPlan}
                    onClick={() => subscribeToPlan(plan.id)}
                    variant={isCurrentPlan ? "outline" : "default"}
                  >
                    {isCurrentPlan ? 'Plan Actual' : 'Seleccionar Plan'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">¿Tienes preguntas sobre los planes?</h3>
              <p className="text-gray-600 mb-4">
                Contáctanos para más información sobre los beneficios y servicios incluidos en cada plan.
              </p>
              <Button variant="outline">Contactar Soporte</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Subscriptions;
