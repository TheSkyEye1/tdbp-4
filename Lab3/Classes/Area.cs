using GMap.NET;
using GMap.NET.WindowsPresentation;
using System;
using System.Windows.Shapes;
using System.Collections.Generic;
using System.Windows.Media.Imaging;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Controls;
using System.Windows.Media;

namespace Lab3.Classes
{
    class Area : MapObject
    {
        PointLatLng point = new PointLatLng();
        List<PointLatLng> points = new List<PointLatLng>();

      public Area(string name,List<PointLatLng> Points, PointLatLng Point) : base(name)
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
            return(new double());
       }

       public override PointLatLng getFocus()
       {
            return point;
       }
       public override GMapMarker GetMarker()
       {
            GMapMarker marker = new GMapPolygon(points)
            {
                Shape = new Path
                {
                    Stroke = Brushes.Black,
                    Fill = Brushes.Green,
                    Opacity = 0.5
                }
            };

            return marker;
       }
       public override DateTime getCreationDate()
       {
            return creationTime;
       }
    }
}
