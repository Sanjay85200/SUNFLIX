package com.sunflix.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api")
public class MovieController {

    @GetMapping("/movies")
    public List<Map<String, String>> getMovies() {
        List<Map<String, String>> movies = new ArrayList<>();

        Map<String, String> movie1 = new HashMap<>();
        movie1.put("id", "1");
        movie1.put("title", "Guardians of the Galaxy Vol. 2");
        movie1.put("poster_path",
                "https://m.media-amazon.com/images/M/MV5BNjM0NTc0NzItM2FlYS00YzEwLWE0YmUtNTA2ZWIzODc2OTgxXkEyXkFqcGdeQXVyNTgwNzIyNTE@._V1_SX300.jpg");
        movies.add(movie1);

        Map<String, String> movie2 = new HashMap<>();
        movie2.put("id", "2");
        movie2.put("title", "Interstellar");
        movie2.put("poster_path",
                "https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjktY2FiMmZkNWIyODZiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg");
        movies.add(movie2);

        return movies;
    }

    // You can add more movie-related endpoints here
}
