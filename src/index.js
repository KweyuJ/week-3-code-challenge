document.addEventListener("DOMContentLoaded", () => {
  const baseURL = "http://localhost:3000";

  // Fetch movie details for the first movie and display on the page
  const fetchFirstMovieDetails = () => {
    fetch(`${baseURL}/films/1`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch movie details");
        }
        return response.json();
      })
      .then((movieData) => {
        displayMovieDetails(movieData);
      })
      .catch((error) => {
        console.error("Error fetching movie details:", error);
      });
  };

  // Display movie details on the page
  const displayMovieDetails = (movieData) => {
    const {
      title,
      runtime,
      capacity,
      showtime,
      tickets_sold,
      description,
      poster,
    } = movieData;
    const availableTickets = capacity - tickets_sold;

    // Enter movie details on the webpage
    document.getElementById("title").textContent = title;
    document.getElementById("runtime").textContent = `${runtime} minutes`;
    document.getElementById("film-info").textContent = description;
    document.getElementById("showtime").textContent = showtime;
    document.getElementById("ticket-num").textContent = availableTickets;
    document.getElementById("poster").src = poster;

    // Update Buy Ticket button text and disable it if tickets are sold out
    const buyTicketButton = document.getElementById("buy-ticket");
    if (availableTickets <= 0) {
      buyTicketButton.textContent = "Sold Out";
      buyTicketButton.disabled = true;
    } else {
      buyTicketButton.textContent = "Buy Ticket";
      buyTicketButton.disabled = false;
    }
  };

  // Fetch movies list and display on the left side menu
  const fetchMoviesList = () => {
    fetch(`${baseURL}/films`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch movies list");
        }
        return response.json();
      })
      .then((moviesList) => {
        displayMoviesList(moviesList);
      })
      .catch((error) => {
        console.error("Error fetching movies list:", error);
      });
  };

  // Display movies list on the left side menu
  const displayMoviesList = (moviesList) => {
    const filmsContainer = document.getElementById("films");

    // Remove placeholder in the li
    const placeholderLi = document.querySelector("#films .film.item");
    if (placeholderLi) {
      placeholderLi.remove();
    }

    // Enter the movie titles into the li tag
    moviesList.forEach((movie) => {
      const li = document.createElement("li");
      li.classList.add("film", "item");
      li.textContent = movie.title;
      li.addEventListener("click", () => {
        fetchMovieDetails(movie.id);
      });
      filmsContainer.appendChild(li);
    });
  };

  // Fetch movie details by ID
  const fetchMovieDetails = (movieId) => {
    fetch(`${baseURL}/films/${movieId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch movie details");
        }
        return response.json();
      })
      .then((movieData) => {
        displayMovieDetails(movieData);
      })
      .catch((error) => {
        console.error("Error fetching movie details:", error);
      });
  };

  // Add event listener for Buy Ticket button
  const addBuyTicketEventListener = (movieId) => {
    const buyTicketButton = document.getElementById("buy-ticket");
    buyTicketButton.addEventListener("click", () => {
      buyTicket(movieId);
    });
  };

  // Buy a ticket for a movie
  const buyTicket = (movieId) => {
    fetch(`${baseURL}/films/${movieId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch movie details");
        }
        return response.json();
      })
      .then((movieData) => {
        const { capacity, tickets_sold } = movieData;
        const ticketsAvailable = capacity - tickets_sold;

        if (ticketsAvailable > 0) {
          // Update tickets_sold on the server using PATCH
          fetch(`${baseURL}/films/${movieId}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              tickets_sold: tickets_sold + 1,
            }),
          })
            .then((response) => {
              if (!response.ok) {
                throw new Error("Failed to update tickets_sold on the server");
              }
              // Post new ticket to the tickets using POST
              return fetch(`${baseURL}/tickets`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  film_id: movieId,
                  number_of_tickets: 1,
                }),
              });
            })
            .then((response) => {
              if (!response.ok) {
                throw new Error(
                  "Failed to post new ticket to the tickets endpoint"
                );
              }
              // Update movieData with new tickets_sold value
              fetchMovieDetails(movieId);
            })
            .catch((error) => {
              console.error("Error purchasing ticket:", error);
            });
        }
      })
      .catch((error) => {
        console.error("Error fetching movie details:", error);
      });
  };


  fetchFirstMovieDetails();
  fetchMoviesList();
});
