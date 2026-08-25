package com.pawcare.backend.dashboard;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.jayway.jsonpath.JsonPath;
import com.pawcare.backend.user.UserRepository;

@SpringBootTest
@AutoConfigureMockMvc
class DashboardControllerTests {
    @Autowired MockMvc mockMvc;
    @Autowired UserRepository users;

    @BeforeEach
    void clearOwners() {
        users.findByEmailIgnoreCase("dashboard-owner@example.com").ifPresent(users::delete);
    }

    @Test
    void ownerCanPersistAndReloadPet() throws Exception {
        String registration = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Dashboard Owner","email":"dashboard-owner@example.com","password":"strong-password"}
                                """))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        String token = JsonPath.read(registration, "$.token");

        mockMvc.perform(post("/api/v1/pets")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Max","species":"Dog","breed":"Labrador","gender":"Male","dob":"2023-06-12","weight":"28 kg","healthStatus":"Healthy","allergies":"None known"}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Max"));

        mockMvc.perform(get("/api/v1/dashboard").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.pets[0].name").value("Max"))
                .andExpect(jsonPath("$.adoptions.length()").value(8));
    }
}
