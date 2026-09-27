package com.campusvote.campusvote;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CandidateRepository extends JpaRepository<Candidate, String> {

    List<Candidate> findByElectionId(String electionId);
}