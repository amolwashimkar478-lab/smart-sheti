<script>
const API_KEY = "4e520dcafeb783757272573493f6a2d3";

function checkWeatherAlert(sprayAdvice){
  navigator.geolocation.getCurrentPosition(pos=>{
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;

    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`)
    .then(res=>res.json())
    .then(data=>{
      const weather = data.weather[0].main;

      if(weather === "Rain"){
        showNotification(
          "🌧️ पाऊस इशारा",
          "आज पाऊस आहे. फवारणी पुढे ढकला ❌"
        );
        alert("🌧️ पाऊस आहे – फवारणी postpone करा");
      }else{
        showNotification(
          "✅ योग्य दिवस",
          "आज फवारणीसाठी योग्य हवामान आहे"
        );
      }
    });
  });
}

function showNotification(title, body){
  if(Notification.permission === "granted"){
    new Notification(title,{ body });
  }else{
    Notification.requestPermission();
  }
}
</script>
