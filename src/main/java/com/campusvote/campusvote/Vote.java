package com.campusvote.campusvote;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "votes")
public class Vote {

    @Id
    private String id;

    private String studentId;
    private String electionId;
    private String candidateId;
    private LocalDateTime votedAt;

    public Vote() {
    }

    public Vote(String id, String studentId, String electionId, String candidateId) {
        this.id = id;
        this.studentId = studentId;
        this.electionId = electionId;
        this.candidateId = candidateId;
        this.votedAt = LocalDateTime.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public String getElectionId() {
        return electionId;
    }

    public void setElectionId(String electionId) {
        this.electionId = electionId;
    }

    public String getCandidateId() {
        return candidateId;
    }

    public void setCandidateId(String candidateId) {
        this.candidateId = candidateId;
    }

    public LocalDateTime getVotedAt() {
        return votedAt;
    }

    public void setVotedAt(LocalDateTime votedAt) {
        this.votedAt = votedAt;
    }
}