package com.campusvote.campusvote;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "elections")
public class Election {

    @Id
    private String id;

    private String title;
    private String type;
    private String status;
    private boolean resultsPublished;

    public Election() {
    }

    public Election(String id, String title, String type, String status, boolean resultsPublished) {
        this.id = id;
        this.title = title;
        this.type = type;
        this.status = status;
        this.resultsPublished = resultsPublished;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public boolean isResultsPublished() {
        return resultsPublished;
    }

    public void setResultsPublished(boolean resultsPublished) {
        this.resultsPublished = resultsPublished;
    }
}