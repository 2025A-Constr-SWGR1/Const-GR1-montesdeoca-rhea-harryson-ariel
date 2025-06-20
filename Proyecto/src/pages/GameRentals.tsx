
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Gamepad, Clock, CheckCircle, AlertTriangle, Timer } from 'lucide-react';
import { GameRental } from '@/types/games';

const GameRentals = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rentals, setRentals] = useState<GameRental[]>([]);
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

      const { data, error } = await (supabase as any)
        .from('game_rentals')
        .select(`
          *,
          games (
            id,
            name,
            type,
            identifier,
            image_url
          ),
          rental_options (
            id,
            duration_minutes,
            price
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

  const handleComplete = async (rentalId: string, gameId: string) => {
    try {
      const endTime = new Date().toISOString();

      // Update rental status
      const { error: rentalError } = await (supabase as any)
        .from('game_rentals')
        .update({
          status: 'completed',
          end_time: endTime
        })
        .eq('id', rentalId);

      if (rentalError) throw rentalError;

      // Update game status back to available
      const { error: gameError } = await (supabase as any)
        .from('games')
        .update({ status: 'available' })
        .eq('id', gameId);

      if (gameError) throw gameError;

      toast({
        title: "Sesión completada",
        description: "El juego ha sido liberado correctamente"
      });

      fetchRentals(); // Refresh the list
    } catch (error) {
      console.error('Error completing rental:', error);
      toast({
        title: "Error",
        description: "No se pudo completar la sesión",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (rental: GameRental) => {
    const now = new Date();
    const expectedEnd = new Date(rental.expected_end_time);
    const isOverdue = rental.status === 'active' && expectedEnd < now;

    if (rental.status === 'completed') {
      return <Badge variant="default" className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Completado</Badge>;
    }
    
    if (isOverdue) {
      return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Tiempo agotado</Badge>;
    }
    
    if (rental.status === 'active') {
      return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Activo</Badge>;
    }

    return <Badge variant="outline">{rental.status}</Badge>;
  };

  const getTimeRemaining = (expectedEndTime: string) => {
    const now = new Date();
    const endTime = new Date(expectedEndTime);
    const diffMs = endTime.getTime() - now.getTime();
    const diffMinutes = Math.ceil(diffMs / (1000 * 60));
    
    if (diffMinutes < 0) {
      return `Tiempo agotado hace ${Math.abs(diffMinutes)} min`;
    } else if (diffMinutes === 0) {
      return 'Tiempo agotado';
    } else {
      return `${diffMinutes} min restantes`;
    }
  };

  const getGameTypeLabel = (type: string) => {
    const labels = {
      billar: 'Billar',
      ping_pong: 'Ping Pong',
      air_hockey: 'Air Hockey',
      videojuego: 'Videojuego'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    return `${minutes / 60}h`;
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
          <p className="text-gray-600">Gestiona tus sesiones activas y revisa tu historial</p>
        </div>

        <div className="space-y-6">
          {rentals.map((rental) => (
            <Card key={rental.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      {rental.games?.image_url ? (
                        <img
                          src={rental.games.image_url}
                          alt={rental.games.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Gamepad className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-xl">{rental.games?.name}</CardTitle>
                      <p className="text-gray-600">
                        {rental.games?.type && getGameTypeLabel(rental.games.type)}
                      </p>
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
                        <p className="text-sm font-medium">Inicio</p>
                        <p className="text-sm text-gray-600">
                          {new Date(rental.start_time).toLocaleString('es-ES')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Timer className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium">Duración</p>
                        <p className="text-sm text-gray-600">
                          {rental.rental_options && formatDuration(rental.rental_options.duration_minutes)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium">Fin esperado</p>
                        <p className="text-sm text-gray-600">
                          {new Date(rental.expected_end_time).toLocaleString('es-ES')}
                        </p>
                      </div>
                    </div>

                    {rental.end_time && (
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <div>
                          <p className="text-sm font-medium">Completado</p>
                          <p className="text-sm text-gray-600">
                            {new Date(rental.end_time).toLocaleString('es-ES')}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium">Total</p>
                      <p className="text-lg font-semibold">${rental.total_amount}</p>
                    </div>

                    {rental.status === 'active' && (
                      <div>
                        <p className="text-sm font-medium">Estado</p>
                        <p className={`text-sm ${
                          getTimeRemaining(rental.expected_end_time).includes('agotado') 
                            ? 'text-red-600' 
                            : 'text-gray-600'
                        }`}>
                          {getTimeRemaining(rental.expected_end_time)}
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
                    
                    {rental.status === 'active' && rental.games && (
                      <Button
                        onClick={() => handleComplete(rental.id, rental.games!.id)}
                        className="w-full"
                      >
                        Completar Sesión
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
              ¡Explora nuestros juegos y alquila tu primera sesión!
            </p>
            <Button asChild>
              <a href="/games">Ver Juegos Disponibles</a>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameRentals;
