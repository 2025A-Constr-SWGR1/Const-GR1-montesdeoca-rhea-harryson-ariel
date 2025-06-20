
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Gamepad, FileText, Clock, CheckCircle } from 'lucide-react';
import Navigation from '@/components/Navigation';

interface DashboardStats {
  totalConsoles: number;
  activeRentals: number;
  completedRentals: number;
  overdueRentals: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalConsoles: 0,
    activeRentals: 0,
    completedRentals: 0,
    overdueRentals: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      // Get user profile
      const { data: profile } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user?.id)
        .single();

      if (!profile) return;

      // Get games count (changed from consoles to games)
      const { count: gamesCount } = await supabase
        .from('games')
        .select('*', { count: 'exact', head: true });

      // Get user rentals
      const { data: rentals } = await supabase
        .from('game_rentals')
        .select('*')
        .eq('user_id', profile.id);

      const activeRentals = rentals?.filter(r => r.status === 'active').length || 0;
      const completedRentals = rentals?.filter(r => r.status === 'completed').length || 0;
      
      // Check for overdue rentals
      const now = new Date();
      const overdueRentals = rentals?.filter(r => 
        r.status === 'active' && new Date(r.expected_end_time) < now
      ).length || 0;

      setStats({
        totalConsoles: gamesCount || 0,
        activeRentals,
        completedRentals,
        overdueRentals
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchStats();

      // Set up real-time subscriptions for games and game_rentals
      const gamesChannel = supabase
        .channel('dashboard-games-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'games'
          },
          () => {
            console.log('Games table updated, refreshing stats...');
            fetchStats();
          }
        )
        .subscribe();

      const rentalsChannel = supabase
        .channel('dashboard-rentals-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'game_rentals'
          },
          () => {
            console.log('Game rentals table updated, refreshing stats...');
            fetchStats();
          }
        )
        .subscribe();

      // Cleanup subscriptions on unmount
      return () => {
        supabase.removeChannel(gamesChannel);
        supabase.removeChannel(rentalsChannel);
      };
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto py-6 px-4">
          <div className="text-center">Cargando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Bienvenido de vuelta, {user?.user_metadata?.name || user?.email}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Juegos Disponibles
              </CardTitle>
              <Gamepad className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalConsoles}</div>
              <p className="text-xs text-muted-foreground">
                Total en el catálogo
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Alquileres Activos
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeRentals}</div>
              <p className="text-xs text-muted-foreground">
                Juegos en alquiler
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Alquileres Completados
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedRentals}</div>
              <p className="text-xs text-muted-foreground">
                Devueltos exitosamente
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Alquileres Vencidos
              </CardTitle>
              <FileText className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{stats.overdueRentals}</div>
              <p className="text-xs text-muted-foreground">
                Requieren atención
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <a
                  href="/games"
                  className="flex items-center p-4 bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
                >
                  <Gamepad className="h-6 w-6 text-primary mr-3" />
                  <div>
                    <h3 className="font-medium">Explorar Juegos</h3>
                    <p className="text-sm text-gray-600">Ver catálogo disponible</p>
                  </div>
                </a>
                
                <a
                  href="/rentals"
                  className="flex items-center p-4 bg-secondary/10 rounded-lg hover:bg-secondary/20 transition-colors"
                >
                  <FileText className="h-6 w-6 text-secondary mr-3" />
                  <div>
                    <h3 className="font-medium">Mis Alquileres</h3>
                    <p className="text-sm text-gray-600">Gestionar alquileres actuales</p>
                  </div>
                </a>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Información del Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Estado del Sistema</span>
                  <span className="text-sm font-medium text-green-600">Operativo</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Último Acceso</span>
                  <span className="text-sm font-medium">
                    {new Date().toLocaleDateString('es-ES')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Tipo de Usuario</span>
                  <span className="text-sm font-medium">Cliente</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
