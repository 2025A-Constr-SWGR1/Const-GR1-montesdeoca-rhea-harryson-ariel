
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Gamepad, Shield, Clock, Star } from "lucide-react";

const Index = () => {
  const { user, loading } = useAuth();

  // Redirect authenticated users to dashboard
  if (user && !loading) {
    return <Navigate to="/dashboard" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-lg">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pt-20 pb-16 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            AEIS Game Rental Hub
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Sistema completo de alquiler de consolas de videojuegos. 
            Alquila las mejores consolas por días con tarifas competitivas.
          </p>
          <div className="space-x-4">
            <Button asChild size="lg">
              <a href="/auth">Comenzar Ahora</a>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href="/auth">Iniciar Sesión</a>
            </Button>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            ¿Por qué elegir AEIS?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center">
              <CardHeader>
                <Gamepad className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Amplio Catálogo</CardTitle>
                <CardDescription>
                  PlayStation, Xbox, Nintendo Switch y más
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Alquiler Flexible</CardTitle>
                <CardDescription>
                  Desde 1 día hasta 30 días de alquiler
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Garantía Total</CardTitle>
                <CardDescription>
                  Consolas verificadas y en excelente estado
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Star className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Servicio Premium</CardTitle>
                <CardDescription>
                  Atención al cliente 24/7 y soporte técnico
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* How it Works Section */}
        <div className="py-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            ¿Cómo funciona?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Regístrate</h3>
              <p className="text-gray-600">
                Crea tu cuenta gratis y accede a nuestro catálogo completo
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Elige y Alquila</h3>
              <p className="text-gray-600">
                Selecciona la consola que deseas y define los días de alquiler
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Disfruta</h3>
              <p className="text-gray-600">
                Recibe tu consola y disfruta de la mejor experiencia gaming
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-16 text-center">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                ¿Listo para comenzar?
              </h2>
              <p className="text-gray-600 mb-6">
                Únete a miles de gamers que ya disfrutan de nuestro servicio
              </p>
              <Button asChild size="lg" className="w-full sm:w-auto">
                <a href="/auth">Crear Cuenta Gratis</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
