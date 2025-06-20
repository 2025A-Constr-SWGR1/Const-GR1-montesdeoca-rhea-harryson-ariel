import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Navigation from '@/components/Navigation';
import { useToast } from '@/hooks/use-toast';
import { Gamepad, Search, Timer, DollarSign, Percent, Clock, AlertCircle } from 'lucide-react';
import { Game, RentalOption } from '@/types/games';
import { useSubscriptions } from '@/hooks/useSubscriptions';

const Games = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { userSubscription, plans } = useSubscriptions();
  const [games, setGames] = useState<Game[]>([]);
  const [rentalOptions, setRentalOptions] = useState<RentalOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [isRenting, setIsRenting] = useState(false);

  useEffect(() => {
    fetchGames();
    fetchRentalOptions();
    
    // Suscripción en tiempo real para cambios en game_rentals
    const gameRentalsChannel = supabase
      .channel('game_rentals_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_rentals'
        },
        (payload) => {
          console.log('Game rental changed:', payload);
          handleGameRentalChange(payload);
        }
      )
      .subscribe();

    // Suscripción en tiempo real para cambios directos en games
    const gamesChannel = supabase
      .channel('games_realtime')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'games'
        },
        (payload) => {
          console.log('Game status updated directly:', payload);
          setGames(prevGames => 
            prevGames.map(game => 
              game.id === payload.new.id 
                ? { ...game, status: payload.new.status }
                : game
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(gameRentalsChannel);
      supabase.removeChannel(gamesChannel);
    };
  }, []);

  const handleGameRentalChange = async (payload: any) => {
    console.log('Processing game rental change:', payload);
    
    // Si es un nuevo alquiler activo, marcar el juego como ocupado inmediatamente
    if (payload.eventType === 'INSERT' && payload.new.status === 'active') {
      console.log('New active rental, marking game as rented:', payload.new.game_id);
      setGames(prevGames => 
        prevGames.map(game => {
          if (game.id === payload.new.game_id) {
            console.log('Game found and updated to rented:', game.name);
            return { ...game, status: 'rented' };
          }
          return game;
        })
      );
    }
    
    // Si se completa o cancela un alquiler, marcar como disponible inmediatamente
    if (payload.eventType === 'UPDATE' && 
        (payload.new.status === 'completed' || payload.new.status === 'cancelled')) {
      console.log('Rental completed/cancelled, marking game as available:', payload.new.game_id);
      setGames(prevGames => 
        prevGames.map(game => {
          if (game.id === payload.new.game_id) {
            console.log('Game found and updated to available:', game.name);
            return { ...game, status: 'available' };
          }
          return game;
        })
      );
    }
    
    // Actualizar estados con función del servidor como respaldo
    setTimeout(() => {
      updateGameStatus();
    }, 1000);
  };

  const updateGameStatus = async () => {
    try {
      console.log('Calling update_game_status RPC function...');
      const { error } = await (supabase as any).rpc('update_game_status');
      if (error) {
        console.error('Error updating game status:', error);
      } else {
        console.log('Game status updated via RPC function successfully');
      }
    } catch (error) {
      console.error('Error calling update_game_status function:', error);
    }
  };

  const checkActiveRentals = async () => {
    try {
      console.log('Checking active rentals...');
      const { data: activeRentals, error } = await supabase
        .from('game_rentals')
        .select('game_id, status, expected_end_time')
        .eq('status', 'active');

      if (error) {
        console.error('Error fetching active rentals:', error);
        return;
      }

      console.log('Active rentals found:', activeRentals);
      
      // Verificar cuáles rentals han expirado
      const now = new Date();
      activeRentals.forEach(rental => {
        const expectedEnd = new Date(rental.expected_end_time);
        console.log(`Rental for game ${rental.game_id}: expected end ${expectedEnd}, now ${now}, expired: ${now > expectedEnd}`);
      });

    } catch (error) {
      console.error('Error checking active rentals:', error);
    }
  };

  const fetchGames = async () => {
    try {
      console.log('Starting fetchGames...');
      
      // Verificar alquileres activos primero
      await checkActiveRentals();
      
      // Actualizar el estado de los juegos
      await updateGameStatus();
      
      console.log('Fetching games from database...');
      const { data, error } = await (supabase as any)
        .from('games')
        .select('*')
        .order('type')
        .order('name');

      if (error) throw error;
      
      console.log('Raw games data from database:', data);
      console.log('Games fetched with current status:', data?.map(g => ({ name: g.name, status: g.status })));
      setGames(data || []);
    } catch (error) {
      console.error('Error fetching games:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los juegos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRentalOptions = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('rental_options')
        .select('*')
        .order('game_type', { ascending: true })
        .order('duration_minutes', { ascending: true });

      if (error) throw error;
      console.log('Rental options fetched:', data);
      setRentalOptions(data || []);
    } catch (error) {
      console.error('Error fetching rental options:', error);
    }
  };

  const filteredGames = games.filter(game =>
    game.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    game.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getGameTypeLabel = (type: string) => {
    const labels = {
      billar: 'Billar',
      ping_pong: 'Ping Pong',
      air_hockey: 'Air Hockey',
      videojuego: 'Videojuego'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getOptionsForGame = (gameType: string) => {
    return rentalOptions.filter(option => option.game_type === gameType);
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    return `${minutes / 60}h`;
  };

  const getDiscountedPrice = (originalPrice: number, gameType: string) => {
    if (!userSubscription || !plans.length) return originalPrice;

    const userPlan = plans.find(plan => plan.id === userSubscription.plan_id);
    if (!userPlan || !userPlan.discounts) return originalPrice;

    // Mapeo de tipos de juego a nombres de descuentos
    const gameTypeMapping: { [key: string]: string } = {
      billar: 'billar',
      ping_pong: 'ping_pong',
      air_hockey: 'air_hockey',
      videojuego: 'videojuegos'
    };

    const mappedGameType = gameTypeMapping[gameType] || gameType;
    const discount = userPlan.discounts.find((d: any) => 
      d.nombre === mappedGameType
    );

    if (discount) {
      const discountPercent = discount.descuento / 100;
      const discountAmount = originalPrice * discountPercent;
      return originalPrice - discountAmount;
    }

    return originalPrice;
  };

  const hasDiscount = (gameType: string) => {
    if (!userSubscription || !plans.length) return false;

    const userPlan = plans.find(plan => plan.id === userSubscription.plan_id);
    if (!userPlan || !userPlan.discounts) return false;

    const gameTypeMapping: { [key: string]: string } = {
      billar: 'billar',
      ping_pong: 'ping_pong',
      air_hockey: 'air_hockey',
      videojuego: 'videojuegos'
    };

    const mappedGameType = gameTypeMapping[gameType] || gameType;
    return userPlan.discounts.some((d: any) => 
      d.nombre === mappedGameType && d.descuento > 0
    );
  };

  const getStatusBadge = (status: string) => {
    console.log('Rendering badge for status:', status);
    switch (status) {
      case 'available':
        return <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">✓ Disponible</Badge>;
      case 'rented':
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-300">
            <AlertCircle className="h-3 w-3 mr-1" />
            En uso
          </Badge>
        );
      case 'maintenance':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">🔧 Mantenimiento</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const isGameAvailable = (game: Game) => {
    const available = game.status === 'available';
    console.log(`Game ${game.name} availability check: status=${game.status}, available=${available}`);
    return available;
  };

  const getButtonText = (game: Game) => {
    switch (game.status) {
      case 'available':
        return 'Alquilar Ahora';
      case 'rented':
        return 'No Disponible - En Uso';
      case 'maintenance':
        return 'En Mantenimiento';
      default:
        return 'No Disponible';
    }
  };

  const handleRent = async () => {
    if (!selectedGame || !selectedOption || !user) return;

    // Verificación estricta antes de proceder
    console.log('Pre-rental check:', { 
      gameId: selectedGame.id, 
      gameName: selectedGame.name, 
      gameStatus: selectedGame.status 
    });

    if (!isGameAvailable(selectedGame)) {
      toast({
        title: "Error",
        description: "Este juego no está disponible en este momento",
        variant: "destructive"
      });
      return;
    }

    setIsRenting(true);

    try {
      // Get user profile
      const { data: profile } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single();

      if (!profile) {
        toast({
          title: "Error",
          description: "No se encontró el perfil de usuario",
          variant: "destructive"
        });
        return;
      }

      const option = rentalOptions.find(o => o.id === selectedOption);
      if (!option) return;

      const finalPrice = getDiscountedPrice(option.price, selectedGame.type);
      const startTime = new Date();
      const expectedEndTime = new Date(startTime.getTime() + option.duration_minutes * 60000);

      // Marcar inmediatamente el juego como ocupado en el UI
      console.log('Marking game as rented immediately in UI:', selectedGame.id);
      setGames(prevGames => 
        prevGames.map(game => 
          game.id === selectedGame.id 
            ? { ...game, status: 'rented' }
            : game
        )
      );

      const { error } = await (supabase as any)
        .from('game_rentals')
        .insert({
          user_id: profile.id,
          game_id: selectedGame.id,
          rental_option_id: selectedOption,
          start_time: startTime.toISOString(),
          expected_end_time: expectedEndTime.toISOString(),
          total_amount: finalPrice,
          notes: notes,
          status: 'active'
        });

      if (error) {
        // Si hay error, revertir el estado visual
        console.log('Error creating rental, reverting UI state');
        setGames(prevGames => 
          prevGames.map(game => 
            game.id === selectedGame.id 
              ? { ...game, status: 'available' }
              : game
          )
        );
        throw error;
      }

      console.log('Rental created successfully');
      toast({
        title: "¡Alquiler exitoso!",
        description: `Has alquilado ${selectedGame.name} por ${formatDuration(option.duration_minutes)}`,
        variant: "default"
      });

      setSelectedGame(null);
      setSelectedOption('');
      setNotes('');
      
    } catch (error) {
      console.error('Error creating rental:', error);
      toast({
        title: "Error",
        description: "No se pudo procesar el alquiler. Intenta nuevamente.",
        variant: "destructive"
      });
    } finally {
      setIsRenting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto py-6 px-4">
          <div className="text-center">Cargando juegos...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Juegos Disponibles</h1>
          
          {userSubscription && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <Percent className="h-4 w-4 text-green-600 mr-2" />
                <span className="text-green-800 font-medium">
                  Tienes descuentos activos con tu suscripción
                </span>
              </div>
            </div>
          )}
          
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar juegos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredGames.map((game) => {
            const gameAvailable = isGameAvailable(game);
            console.log(`Rendering game ${game.name} with status: ${game.status}, available: ${gameAvailable}`);
            
            return (
              <Card key={game.id} className={`overflow-hidden transition-all duration-200 ${
                !gameAvailable ? 'opacity-75 ring-2 ring-red-200' : 'hover:shadow-lg'
              }`}>
                <CardHeader className="pb-3">
                  <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-3 relative">
                    {game.image_url ? (
                      <img
                        src={game.image_url}
                        alt={game.name}
                        className={`w-full h-full object-cover rounded-lg ${
                          !gameAvailable ? 'grayscale' : ''
                        }`}
                      />
                    ) : (
                      <Gamepad className={`h-12 w-12 ${
                        gameAvailable ? 'text-gray-400' : 'text-gray-300'
                      }`} />
                    )}
                    
                    {!gameAvailable && (
                      <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {game.status === 'rented' ? 'EN USO' : 'NO DISPONIBLE'}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <CardTitle className="text-lg">{game.name}</CardTitle>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline">
                      {getGameTypeLabel(game.type)}
                    </Badge>
                    {getStatusBadge(game.status)}
                    {hasDiscount(game.type) && gameAvailable && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <Percent className="h-3 w-3 mr-1" />
                        Descuento
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Opciones de tiempo:</h4>
                    {getOptionsForGame(game.type).map((option) => {
                      const originalPrice = option.price;
                      const discountedPrice = getDiscountedPrice(originalPrice, game.type);
                      const hasDiscountApplied = discountedPrice !== originalPrice;
                      
                      return (
                        <div key={option.id} className={`flex justify-between items-center text-sm ${
                          !gameAvailable ? 'opacity-50' : ''
                        }`}>
                          <span className="flex items-center">
                            <Timer className="h-3 w-3 mr-1" />
                            {formatDuration(option.duration_minutes)}
                          </span>
                          <div className="flex items-center">
                            {hasDiscountApplied && (
                              <span className="text-gray-400 line-through text-xs mr-2">
                                ${originalPrice.toFixed(2)}
                              </span>
                            )}
                            <span className="flex items-center font-medium">
                              <DollarSign className="h-3 w-3 mr-1" />
                              {discountedPrice.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
                
                <CardFooter>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        className={`w-full transition-all duration-200 ${
                          !gameAvailable 
                            ? 'bg-gray-400 hover:bg-gray-400 cursor-not-allowed opacity-50' 
                            : ''
                        }`}
                        onClick={() => gameAvailable && setSelectedGame(game)}
                        disabled={!gameAvailable}
                      >
                        {getButtonText(game)}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Alquilar {selectedGame?.name}</DialogTitle>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                            {selectedGame?.image_url ? (
                              <img
                                src={selectedGame.image_url}
                                alt={selectedGame.name}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <Gamepad className="h-8 w-8 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold">{selectedGame?.name}</h3>
                            <p className="text-sm text-gray-600">
                              {selectedGame && getGameTypeLabel(selectedGame.type)}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              {selectedGame && getStatusBadge(selectedGame.status)}
                              {selectedGame && hasDiscount(selectedGame.type) && isGameAvailable(selectedGame) && (
                                <Badge variant="secondary" className="bg-green-100 text-green-800">
                                  <Percent className="h-3 w-3 mr-1" />
                                  Con descuento
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {selectedGame && isGameAvailable(selectedGame) ? (
                          <div className="space-y-3">
                            <div>
                              <Label htmlFor="duration">Duración</Label>
                              <Select value={selectedOption} onValueChange={setSelectedOption}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecciona la duración" />
                                </SelectTrigger>
                                <SelectContent>
                                  {selectedGame && getOptionsForGame(selectedGame.type).map((option) => {
                                    const originalPrice = option.price;
                                    const discountedPrice = getDiscountedPrice(originalPrice, selectedGame.type);
                                    const hasDiscountApplied = discountedPrice !== originalPrice;
                                    
                                    return (
                                      <SelectItem key={option.id} value={option.id}>
                                        <div className="flex items-center justify-between w-full">
                                          <span>{formatDuration(option.duration_minutes)}</span>
                                          <div className="ml-2">
                                            {hasDiscountApplied && (
                                              <span className="text-gray-400 line-through text-xs mr-2">
                                                ${originalPrice.toFixed(2)}
                                              </span>
                                            )}
                                            <span>${discountedPrice.toFixed(2)}</span>
                                          </div>
                                        </div>
                                      </SelectItem>
                                    );
                                  })}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div>
                              <Label htmlFor="notes">Notas (opcional)</Label>
                              <Input
                                id="notes"
                                placeholder="Comentarios adicionales..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                              />
                            </div>
                            
                            {selectedOption && selectedGame && (
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <div className="flex justify-between font-semibold">
                                  <span>Total:</span>
                                  <span>
                                    ${getDiscountedPrice(
                                      rentalOptions.find(o => o.id === selectedOption)?.price || 0,
                                      selectedGame.type
                                    ).toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            )}
                            
                            <Button 
                              onClick={handleRent} 
                              className="w-full"
                              disabled={!selectedOption || isRenting}
                            >
                              {isRenting ? 'Procesando...' : 'Confirmar Alquiler'}
                            </Button>
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-2" />
                            <p className="text-gray-600 font-medium">
                              {selectedGame?.status === 'rented' 
                                ? '🎮 Este juego está siendo utilizado actualmente' 
                                : '❌ Este juego no está disponible en este momento'}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              {selectedGame?.status === 'rented' 
                                ? 'Espera a que termine el alquiler actual para poder usarlo'
                                : 'Intenta con otro juego disponible'}
                            </p>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {filteredGames.length === 0 && (
          <div className="text-center py-12">
            <Gamepad className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay juegos disponibles
            </h3>
            <p className="text-gray-600">
              {searchTerm ? 'Intenta con otro término de búsqueda' : 'No se encontraron juegos.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Games;
