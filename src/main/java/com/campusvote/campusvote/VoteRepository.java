package com.campusvote.campusvote;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface VoteRepository extends JpaRepository<Vote, String> {

    boolean existsByStudentIdAndElectionId(String studentId, String electionId);

    List<Vote> findByStudentId(String studentId);

    @Query("SELECT c.id, c.name, COUNT(v.id) " +
       "FROM Candidate c " +
       "LEFT JOIN Vote v ON v.candidateId = c.id " +
       "WHERE c.electionId = :electionId " +
       "GROUP BY c.id, c.name")
List<Object[]> countVotesByCandidate(@Param("electionId") String electionId);

@Query("SELECT COUNT(DISTINCT v.studentId) FROM Vote v")
long countUniqueVoters();
}