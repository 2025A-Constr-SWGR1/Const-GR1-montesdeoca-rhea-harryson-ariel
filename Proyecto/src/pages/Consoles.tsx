
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Navigation from '@/components/Navigation';
import { useToast } from '@/hooks/use-toast';
import { Gamepad, Search } from 'lucide-react';

interface Console {
  id: string;
  name: string;
  model: string;
  condition: string;
  daily_rate: number;
  status: string;
  image_url: string;
  notes: string;
}

const Consoles = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [consoles, setConsoles] = useState<Console[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConsole, setSelectedConsole] = useState<Console | null>(null);
  const [rentalForm, setRentalForm] = useState({
    days: 1,
    notes: ''
  });

  useEffect(() => {
    fetchConsoles();
  }, []);

  const fetchConsoles = async () => {
    try {
      const { data, error } = await supabase
        .from('consoles')
        .select('*')
        .eq('status', 'available')
        .order('name');

      if (error) throw error;
      setConsoles(data || []);
    } catch (error) {
      console.error('Error fetching consoles:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las consolas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredConsoles = consoles.filter(console =>
    console.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    console.model?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRent = async () => {
    if (!selectedConsole || !user) return;

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

      const rentalDate = new Date();
      const expectedReturnDate = new Date();
      expectedReturnDate.setDate(rentalDate.getDate() + rentalForm.days);

      const { error } = await supabase
        .from('rentals')
        .insert({
          user_id: profile.id,
          console_id: selectedConsole.id,
          rental_date: rentalDate.toISOString().split('T')[0],
          expected_return_date: expectedReturnDate.toISOString().split('T')[0],
          daily_rate: selectedConsole.daily_rate,
          total_amount: selectedConsole.daily_rate * rentalForm.days,
          notes: rentalForm.notes,
          status: 'active'
        });

      if (error) throw error;

      // Update console status
      await supabase
        .from('consoles')
        .update({ status: 'rented' })
        .eq('id', selectedConsole.id);

      toast({
        title: "¡Alquiler exitoso!",
        description: `Has alquilado ${selectedConsole.name} por ${rentalForm.days} días`
      });

      setSelectedConsole(null);
      setRentalForm({ days: 1, notes: '' });
      fetchConsoles(); // Refresh the list
    } catch (error) {
      console.error('Error creating rental:', error);
      toast({
        title: "Error",
        description: "No se pudo procesar el alquiler",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto py-6 px-4">
          <div className="text-center">Cargando consolas...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Catálogo de Consolas</h1>
          
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar consolas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredConsoles.map((console) => (
            <Card key={console.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                  {console.image_url ? (
                    <img
                      src={console.image_url}
                      alt={console.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <Gamepad className="h-12 w-12 text-gray-400" />
                  )}
                </div>
                <CardTitle className="text-lg">{console.name}</CardTitle>
                {console.model && (
                  <p className="text-sm text-gray-600">{console.model}</p>
                )}
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant={console.condition === 'excellent' ? 'default' : 'secondary'}>
                    {console.condition === 'excellent' ? 'Excelente' : 
                     console.condition === 'good' ? 'Bueno' : 'Regular'}
                  </Badge>
                  <Badge variant="outline">
                    ${console.daily_rate}/día
                  </Badge>
                </div>
                
                {console.notes && (
                  <p className="text-sm text-gray-600 line-clamp-2">{console.notes}</p>
                )}
              </CardContent>
              
              <CardFooter>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      className="w-full"
                      onClick={() => setSelectedConsole(console)}
                    >
                      Alquilar
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Alquilar {selectedConsole?.name}</DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                          {selectedConsole?.image_url ? (
                            <img
                              src={selectedConsole.image_url}
                              alt={selectedConsole.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <Gamepad className="h-8 w-8 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold">{selectedConsole?.name}</h3>
                          <p className="text-sm text-gray-600">{selectedConsole?.model}</p>
                          <p className="text-sm font-medium">${selectedConsole?.daily_rate}/día</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="days">Días de alquiler</Label>
                          <Input
                            id="days"
                            type="number"
                            min="1"
                            max="30"
                            value={rentalForm.days}
                            onChange={(e) => setRentalForm({
                              ...rentalForm,
                              days: parseInt(e.target.value) || 1
                            })}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="notes">Notas (opcional)</Label>
                          <Input
                            id="notes"
                            placeholder="Comentarios adicionales..."
                            value={rentalForm.notes}
                            onChange={(e) => setRentalForm({
                              ...rentalForm,
                              notes: e.target.value
                            })}
                          />
                        </div>
                        
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex justify-between text-sm">
                            <span>Subtotal ({rentalForm.days} días):</span>
                            <span>${(selectedConsole?.daily_rate || 0) * rentalForm.days}</span>
                          </div>
                          <div className="flex justify-between font-semibold">
                            <span>Total:</span>
                            <span>${(selectedConsole?.daily_rate || 0) * rentalForm.days}</span>
                          </div>
                        </div>
                        
                        <Button onClick={handleRent} className="w-full">
                          Confirmar Alquiler
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardFooter>
            </Card>
          ))}
        </div>

        {filteredConsoles.length === 0 && (
          <div className="text-center py-12">
            <Gamepad className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay consolas disponibles
            </h3>
            <p className="text-gray-600">
              {searchTerm ? 'Intenta con otro término de búsqueda' : 'Vuelve más tarde para ver nuevas opciones'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Consoles;
