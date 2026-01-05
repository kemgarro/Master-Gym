Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
ps = "powershell.exe"
cmd = "-ExecutionPolicy Bypass -File """ & scriptDir & "\Start-MasterGym.ps1""""
shell.Run ps & " " & cmd, 0, False
