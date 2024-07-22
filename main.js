const apiKeyWeather = "af850ee8c50866687e77ab33cc12bdbb";
 const apiKeyImage = "44752364-afb0e3777e04db30cc3f88e82";
export const formSearch = document.querySelector(".search-form");
formSearch.addEventListener("submit", handlerSearch)

let queryValue



export async function handlerSearch(evt) {
    evt.preventDefault()
    const form = evt.currentTarget;
    queryValue = form.elements.search.value.trim()
    if (queryValue === "") { 
        Notiflix.Notify.warning("Please enter the city");
        return
    }
    // ПОдставить Notiflix для алертов
    try {
        const { currentWeather, forecast } = await getWeather(queryValue)
        displayWeather(currentWeather)
        displayHourlyForecast(forecast)
        
    }
    catch (error) {
        Notiflix.Notify.failure("An unexpected error occurred");
    }
}

async function getWeather() {  
    try {
        const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?q=${queryValue}&appid=${apiKeyWeather}`
        );

        const responseForecast = await axios.get(
            `https://api.openweathermap.org/data/2.5/forecast?q=${queryValue}&appid=${apiKeyWeather}`
        );
        if (response.status !== 200) {
            Notiflix.Notify.failure("Failed to fetch current weather data.");
            return;
        }

        if (responseForecast.status !== 200) {
            Notiflix.Notify.failure("Failed to fetch weather forecast data.");
            return;
        }
        return {
            currentWeather: response.data,
            forecast: responseForecast.data.list,
        };
    }
    catch (error) {
        Notiflix.Notify.failure("City not found.");
        console.error("Error:", error);
        return;
    }
    finally { 
        formSearch.reset()
    }

}

function displayWeather(data) { 
    const weatherInfoDiv = document.querySelector(".weather-info");
    const tempDivInfo = document.querySelector(".temp-div");
      const hourlyForecastDiv = document.querySelector(".hourly-forecast");
      hourlyForecastDiv.innerHTML = "";
    weatherInfoDiv.innerHTML = ''
    tempDivInfo.innerHTML = ''

    if (data.cod === '404') {
        weatherInfoDiv.innerHTML = `<p>${data.message}</p>`
    } else { 
        const cityName = data.name; 
        const temperature = Math.round(data.main.temp - 273.15)
        const description = data.weather[0].description
        const temperatureHTML = `<p>${temperature}°C</p>`;
        const weatherHTML = `<p>${cityName}</p>
                        <p>${description}</p>`;
        tempDivInfo.innerHTML = temperatureHTML;
        weatherInfoDiv.innerHTML = weatherHTML;
        getBackroungImage(data);
        
    }
    
    
}

async function getBackroungImage(data) { 
    const weatherContainer = document.querySelector(".weather-container")
     const params = new URLSearchParams({
       key: apiKeyImage,
         q:data.weather[0].description,
       image_type: "nature",
       orientation: "horizontal",
       safesearch: true,
       page: 1,
       per_page: 3,
     });
    try {
        const response = await axios.get(`https://pixabay.com/api/?${params}`);
        if (response.data.hits.length === 0) {
            return
        }
        const urlImage = response.data.hits[0].largeImageURL;
        weatherContainer.style.backgroundImage = `url(${urlImage})`;
        console.log(response.data.hits[0]);
        return weatherContainer
    }
    catch (error){ 
          console.error("Error fetching background image:", error);
          Notiflix.Notify.failure("Failed to fetch background image.");
    }
}

function displayHourlyForecast(hourlyData) { 
    const hourlyForecastDiv = document.querySelector(".hourly-forecast");
    const next24Hours = hourlyData.slice(0, 6)
    
    next24Hours.forEach(item => { 
        const dataTime = new Date(item.dt * 1000)
        const hour = dataTime.getHours();
        const temperature = Math.round(item.main.temp - 273.15)
        const iconCode = item.weather[0].icon
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`;
        const hourlyItemHTML = `<div class='hourly-item'>
    <span>${hour}</span>
    <img src="${iconUrl}" alt="Hourly Weather Icon">
    <span>${temperature}</span>
    </div>`;
         hourlyForecastDiv.innerHTML += hourlyItemHTML;
    })
   
    
}




