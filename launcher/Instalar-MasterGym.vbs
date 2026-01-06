Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
ps = "powershell.exe"
cmd = "-ExecutionPolicy Bypass -File " & Chr(34) & scriptDir & "\Install-MasterGym.ps1" & Chr(34)
shell.Run ps & " " & cmd, 0, True
