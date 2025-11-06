using Microsoft.AspNetCore.Mvc;
using AspNetCoreFileManager.Demo.Models;
using System.Diagnostics;

namespace AspNetCoreFileManager.Demo.Controllers;

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

    public IActionResult BasicUsage()
    {
        return View();
    }

    public IActionResult CustomConfiguration()
    {
        return View();
    }

    public IActionResult RtlSupport()
    {
        return View();
    }

    public IActionResult MultipleInstances()
    {
        return View();
    }

    public IActionResult ApiReference()
    {
        return View();
    }

    public IActionResult PersianLocalization()
    {
        return View();
    }

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
}

