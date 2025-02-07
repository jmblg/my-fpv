# Spécifiez le répertoire
$repertoire = "D:\Documents JM\Professionnel\technifutur\js\my-fpv\img\textures"

# Obtenez tous les fichiers dans le répertoire
$fichiers = Get-ChildItem -Path $repertoire -File

# Parcourez les fichiers et générez la liste avec des virgules et des guillemets
$fichiersNomAvecVirgule = $fichiers | ForEach-Object { "`"$( $_.BaseName )$($_.Extension)`"," }

# Joindre tous les noms avec un saut de ligne
$listeAvecVirgules = $fichiersNomAvecVirgule -join "`n"

# Afficher la liste
$listeAvecVirgules

# Ajouter une pause pour garder la fenêtre ouverte
Read-Host -Prompt "Appuyez sur [Entrée] pour fermer"
