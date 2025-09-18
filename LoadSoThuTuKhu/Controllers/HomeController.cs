using System.Diagnostics;
using LoadSoThuTuKhu.Models;
using Microsoft.AspNetCore.Mvc;

namespace LoadSoThuTuKhu.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;

        public HomeController(ILogger<HomeController> logger)
        {
            _logger = logger;
        }

        public IActionResult Index()
        {
            return View();
        }

        public IActionResult Privacy()
        {
            return View();
        }

       
    }
}
