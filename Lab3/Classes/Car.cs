using GMap.NET;
using GMap.NET.WindowsPresentation;
using System;
using System.Collections.Generic;
using System.Windows.Media.Imaging;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Controls;

namespace Lab3.Classes
{
    class Car : MapObject
    {
        PointLatLng point = new PointLatLng();

        public Car(string name, PointLatLng Point) : base(name)
        {
            this.point = Point;
        }

        public override double getDistance()
        {
            return (new double());
        }

        public override PointLatLng getFocus()
        {
            return point;
        }

        public override DateTime getCreationDate()
        {
            throw new NotImplementedException();
        }

        public override GMapMarker GetMarker()
        {
            GMapMarker marker = new GMapMarker(point)
            {
                Shape = new Image
                {
                    Width = 32,
                    Height = 32,
                    ToolTip = "машина",
                    Source = new BitmapImage(new Uri("pack://application:,,,/Resources/car.png"))
                }
            };
            return marker;
        }

        public override string getTitle()
        {
            throw new NotImplementedException();
        }
    }
}
