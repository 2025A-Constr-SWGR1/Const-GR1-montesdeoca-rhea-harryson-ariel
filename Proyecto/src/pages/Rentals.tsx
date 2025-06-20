
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Gamepad, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

interface Rental {
  id: string;
  rental_date: string;
  expected_return_date: string;
  return_date: string | null;
  daily_rate: number;
  total_amount: number;
  status: string;
  notes: string | null;
  consoles: {
    id: string;
    name: string;
    model: string;
    image_url: string;
  };
}

const Rentals = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRentals();
  }, [user]);

  const fetchRentals = async () => {
    if (!user) return;

    try {
      // Get user profile
      const { data: profile } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single();

      if (!profile) return;

      const { data, error } = await supabase
        .from('rentals')
        .select(`
          *,
          consoles (
            id,
            name,
            model,
            image_url
          )
        `)
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRentals(data || []);
    } catch (error) {
      console.error('Error fetching rentals:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los alquileres",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (rentalId: string, consoleId: string) => {
    try {
      const returnDate = new Date().toISOString().split('T')[0];

      // Update rental status
      const { error: rentalError } = await supabase
        .from('rentals')
        .update({
          status: 'returned',
          return_date: returnDate
        })
        .eq('id', rentalId);

      if (rentalError) throw rentalError;

      // Update console status back to available
      const { error: consoleError } = await supabase
        .from('consoles')
        .update({ status: 'available' })
        .eq('id', consoleId);

      if (consoleError) throw consoleError;

      toast({
        title: "Devolución exitosa",
        description: "La consola ha sido devuelta correctamente"
      });

      fetchRentals(); // Refresh the list
    } catch (error) {
      console.error('Error returning rental:', error);
      toast({
        title: "Error",
        description: "No se pudo procesar la devolución",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (rental: Rental) => {
    const today = new Date().toISOString().split('T')[0];
    const isOverdue = rental.status === 'active' && rental.expected_return_date < today;

    if (rental.status === 'returned') {
      return <Badge variant="default" className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Devuelto</Badge>;
    }
    
    if (isOverdue) {
      return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Vencido</Badge>;
    }
    
    if (rental.status === 'active') {
      return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Activo</Badge>;
    }

    return <Badge variant="outline">{rental.status}</Badge>;
  };

  const getDaysRemaining = (expectedReturnDate: string) => {
    const today = new Date();
    const returnDate = new Date(expectedReturnDate);
    const diffTime = returnDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `Vencido hace ${Math.abs(diffDays)} día(s)`;
    } else if (diffDays === 0) {
      return 'Vence hoy';
    } else {
      return `${diffDays} día(s) restantes`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto py-6 px-4">
          <div className="text-center">Cargando alquileres...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Alquileres</h1>
          <p className="text-gray-600">Gestiona tus alquileres activos y revisa tu historial</p>
        </div>

        <div className="space-y-6">
          {rentals.map((rental) => (
            <Card key={rental.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      {rental.consoles.image_url ? (
                        <img
                          src={rental.consoles.image_url}
                          alt={rental.consoles.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Gamepad className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-xl">{rental.consoles.name}</CardTitle>
                      <p className="text-gray-600">{rental.consoles.model}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(rental)}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium">Fecha de alquiler</p>
                        <p className="text-sm text-gray-600">
                          {new Date(rental.rental_date).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium">Fecha esperada de devolución</p>
                        <p className="text-sm text-gray-600">
                          {new Date(rental.expected_return_date).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    </div>

                    {rental.return_date && (
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <div>
                          <p className="text-sm font-medium">Fecha de devolución</p>
                          <p className="text-sm text-gray-600">
                            {new Date(rental.return_date).toLocaleDateString('es-ES')}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium">Tarifa diaria</p>
                      <p className="text-lg font-semibold">${rental.daily_rate}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium">Total</p>
                      <p className="text-lg font-semibold">${rental.total_amount}</p>
                    </div>

                    {rental.status === 'active' && (
                      <div>
                        <p className="text-sm font-medium">Estado</p>
                        <p className={`text-sm ${
                          getDaysRemaining(rental.expected_return_date).includes('Vencido') 
                            ? 'text-red-600' 
                            : 'text-gray-600'
                        }`}>
                          {getDaysRemaining(rental.expected_return_date)}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    {rental.notes && (
                      <div>
                        <p className="text-sm font-medium">Notas</p>
                        <p className="text-sm text-gray-600">{rental.notes}</p>
                      </div>
                    )}
                    
                    {rental.status === 'active' && (
                      <Button
                        onClick={() => handleReturn(rental.id, rental.consoles.id)}
                        className="w-full"
                      >
                        Devolver Consola
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {rentals.length === 0 && (
          <div className="text-center py-12">
            <Gamepad className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No tienes alquileres
            </h3>
            <p className="text-gray-600 mb-4">
              ¡Explora nuestro catálogo y alquila tu primera consola!
            </p>
            <Button asChild>
              <a href="/consoles">Ver Consolas Disponibles</a>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Rentals;
