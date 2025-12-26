package com.mastergym.backend.common.backup;

public class BackupResponse {

    private boolean success;
    private int exitCode;
    private String output;

    public BackupResponse(boolean success, int exitCode, String output) {
        this.success = success;
        this.exitCode = exitCode;
        this.output = output;
    }

    public boolean isSuccess() {
        return success;
    }

    public int getExitCode() {
        return exitCode;
    }

    public String getOutput() {
        return output;
    }
}
