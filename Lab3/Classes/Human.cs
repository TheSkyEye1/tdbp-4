using GMap.NET;
using GMap.NET.WindowsPresentation;
using System;
using System.Collections.Generic;
using System.Windows.Media.Imaging;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Controls;

namespace Lab3
{
    class Human : MapObject
    {
        PointLatLng point = new PointLatLng();

        public Human(string name, PointLatLng Point) : base(name)
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

        public override string getTitle()
        {
            throw new NotImplementedException();
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
                    ToolTip = "Человек",
                    Source = new BitmapImage(new Uri("pack://application:,,,/Resources/men.png"))
                }
            };
            return marker;
        }
    }
}
