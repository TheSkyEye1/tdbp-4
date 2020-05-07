using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;
using GMap.NET;
using GMap.NET.MapProviders;
using GMap.NET.WindowsPresentation;
using System.Device.Location;
using Lab3.Classes;

namespace Lab3
{
    /// <summary>
    /// Логика взаимодействия для MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window
    {
        public List<MapObject> mapObjects = new List<MapObject>();
        public PointLatLng point = new PointLatLng();
        public List<PointLatLng> areapoints = new List<PointLatLng>();
        public List<PointLatLng> routepoints = new List<PointLatLng>();
        int rpointc = 0;
        int apointc = 0;
        public MainWindow()
        {
            InitializeComponent();
            MapLoad();
        }

        private void MapLoad()
        {
            GMaps.Instance.Mode = AccessMode.ServerAndCache;
            Map.MapProvider = GMapProviders.GoogleMap;
            Map.MinZoom = 2;
            Map.MaxZoom = 17;
            Map.Zoom = 15;
            Map.Position = new PointLatLng(55.012823, 82.950359);
            Map.MouseWheelZoomType = MouseWheelZoomType.MousePositionAndCenter;
            Map.CanDragMap = true;
            Map.DragButton = MouseButton.Left;
        }
        

        private void Map_MouseLeftButtonDown(object sender, MouseButtonEventArgs e)
        {
           
        }

        private void MapLoaded(object sender, RoutedEventArgs e)
        {

        }

        private void Map_MouseDoubleClick(object sender, MouseButtonEventArgs e)
        {
            if (combox.SelectedIndex == 0)
            {
                point = Map.FromLocalToLatLng((int)e.GetPosition(Map).X, (int)e.GetPosition(Map).Y);
                placepoint(point);

            }
            if(combox.SelectedIndex == 1)
            {
                point = Map.FromLocalToLatLng((int)e.GetPosition(Map).X, (int)e.GetPosition(Map).Y);
                placecar(point);
            }
            if(combox.SelectedIndex == 2)
            {
                point = Map.FromLocalToLatLng((int)e.GetPosition(Map).X, (int)e.GetPosition(Map).Y);
                placehuman(point);
            }
            if(combox.SelectedIndex == 3)
            {
                point = Map.FromLocalToLatLng((int)e.GetPosition(Map).X, (int)e.GetPosition(Map).Y);
                routepoints.Add(point);
                rpointc += 1;
                if(rpointc >= 2)
                {
                    createra.IsEnabled = true;
                }
            }
            if (combox.SelectedIndex == 4)
            {
                point = Map.FromLocalToLatLng((int)e.GetPosition(Map).X, (int)e.GetPosition(Map).Y);
                areapoints.Add(point);
                apointc += 1;
                if (apointc >= 3)
                {
                    createra.IsEnabled = true;
                }
            }
        }

        public void placepoint(PointLatLng clickedPoint)
        {
            MapObject mapObject_point = new Location_c(OName.Text, clickedPoint);
            mapObjects.Add(mapObject_point);
            Map.Markers.Add(mapObject_point.GetMarker());
            OList.Items.Add("Point - " + mapObjects.Last().objectName);
        }
        public void placecar(PointLatLng clickedPoint)
        {
            MapObject mapObject_point = new Car(OName.Text, clickedPoint);
            mapObjects.Add(mapObject_point);
            Map.Markers.Add(mapObject_point.GetMarker());
            OList.Items.Add("Car - " + mapObjects.Last().objectName);
        }
        public void placehuman(PointLatLng clickedPoint)
        {
            MapObject mapObject_point = new Human(OName.Text, clickedPoint);
            mapObjects.Add(mapObject_point);
            Map.Markers.Add(mapObject_point.GetMarker());
            OList.Items.Add("People - " + mapObjects.Last().objectName);
        }
        public void createroute(List<PointLatLng> points)
        {
            rpointc = 0;
            MapObject mapObject_path = new Route_c(OName.Text, points, points[0]);
            mapObjects.Add(mapObject_path);
            Map.Markers.Add(mapObject_path.GetMarker());
            OList.Items.Add("Route - " + mapObjects.Last().objectName);
            routepoints.Clear();
            createra.IsEnabled = false;
        }
        public void createarea(List<PointLatLng> points)
        {
            apointc = 0;
            MapObject mapObject_area = new Area(OName.Text, points, points[0]);
            mapObjects.Add(mapObject_area);
            Map.Markers.Add(mapObject_area.GetMarker());
            OList.Items.Add("Area - " + mapObjects.Last().objectName);
            areapoints.Clear();
            createra.IsEnabled = false;
        }

        private void OList_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            Map.Position = mapObjects[OList.SelectedIndex].getFocus();
        }

        private void Createra_Click(object sender, RoutedEventArgs e)
        {
            if(combox.SelectedIndex == 3)
            {
                createroute(routepoints);
            }
            if(combox.SelectedIndex == 4)
            {
                createarea(areapoints);
            }
        }

        private void Combox_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            rpointc = 0;
            apointc = 0;
            areapoints.Clear();
            routepoints.Clear();
        }
    }

    

}
