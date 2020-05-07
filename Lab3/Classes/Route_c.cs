using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using GMap.NET;
using GMap.NET.MapProviders;
using GMap.NET.WindowsPresentation;
using System.Device.Location;
using System.Windows.Shapes;
using System.Windows.Media;

namespace Lab3.Classes
{
    class Route_c : MapObject
    {
        PointLatLng point = new PointLatLng();
        List<PointLatLng> points = new List<PointLatLng>();
        public Route_c(string name, List<PointLatLng> Points, PointLatLng Point) : base(name)
        {
            this.point = Point;
            this.points = Points;
        }
        public override string getTitle()
        {
            return objectName;
        }
        public override double getDistance()
        {
            return (new double());
        }

        public override PointLatLng getFocus()
        {
            return point;
        }

        public override GMapMarker GetMarker()
        {
            GMapMarker marker = new GMapRoute(points)
            {
                Shape = new Path()
                {
                    Stroke = Brushes.DarkBlue,
                    Fill = Brushes.DarkBlue,
                    StrokeThickness = 4
                }
            };
            return marker;
        }

        public override DateTime getCreationDate()
        {
            return new DateTime();
        }

        
    }
}
