package com.mastergym.backend.common.backup;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/backup")
public class BackupController {

    private final BackupService backupService;

    public BackupController(BackupService backupService) {
        this.backupService = backupService;
    }

    @PostMapping
    public BackupResponse runBackup(@RequestHeader(value = "X-BACKUP-TOKEN", required = false) String token) {
        return backupService.run(token);
    }
}
