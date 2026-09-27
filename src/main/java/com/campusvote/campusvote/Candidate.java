package com.campusvote.campusvote;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "candidates")
public class Candidate {

    @Id
    private String id;

    private String name;
    private String manifesto;
    private String electionId;

    public Candidate() {
    }

    public Candidate(String id, String name, String manifesto, String electionId) {
        this.id = id;
        this.name = name;
        this.manifesto = manifesto;
        this.electionId = electionId;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getManifesto() {
        return manifesto;
    }

    public void setManifesto(String manifesto) {
        this.manifesto = manifesto;
    }

    public String getElectionId() {
        return electionId;
    }

    public void setElectionId(String electionId) {
        this.electionId = electionId;
    }
}