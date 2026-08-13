# J00 — L'EMBAUCHE
### Phase 0 · Durée : une demi-journée · XP : 30

> *De : Mme KERBRAT, DRH — À : la nouvelle recrue*
> *« Bienvenue à la CGBA. Votre badge est au 3e sous-sol, votre bureau est à côté de
> la climatisation du mainframe (désolée). M. Dubois vous attend. Il a dit, je cite :
> "qu'il/elle vienne avec une machine qui compile, le reste on verra". »*

Objectif du jour : un poste de travail opérationnel + votre premier programme validé
par BERTHA.

---

## 1. INSTALLER GNUCOBOL (le compilateur)

GnuCOBOL traduit votre COBOL en C puis en exécutable natif. Version cible : **3.2 ou
supérieure**.

### Linux (Ubuntu/Debian — recommandé, y compris via WSL sous Windows)
```bash
sudo apt update
sudo apt install gnucobol
cobc --version        # doit afficher cobc (GnuCOBOL) 3.x
```

### Windows
- **Option recommandée : WSL2** (Ubuntu dans Windows) puis la commande Linux
  ci-dessus. C'est l'environnement le plus proche de la réalité pro.
- Option native : l'installeur "GnuCOBOL All-in-One" (paquet MSI, projet SuperBOL)
  ou le paquet Chocolatey `choco install gnucobol`.

### macOS
```bash
brew install gnucobol
```

### Option zéro-installation (dépannage J01-J03 uniquement)
Des compilateurs COBOL en ligne existent (OneCompiler, TutorialsPoint...). Ils
suffisent pour les 3 premiers jours, mais **BERTHA tourne en local** : installez un
vrai environnement avant J04. Un artisan a ses outils.

## 2. L'ÉDITEUR

**VS Code** + extension **"COBOL"** (bitlang.cobol) : coloration, règle colonne 72,
repli des divisions. Réglage indispensable : `"editor.rulers": [7, 11, 72]`.
Vim/Emacs fonctionnent aussi — Marcel utilise `vi` depuis 1993 et vous juge en
silence.

## 3. GIT (le carnet de bord)

```bash
git init cobol-quest-rendu
cd cobol-quest-rendu
mkdir -p rendu
```
Un commit par exercice validé, message : `J01/ex02: valide BERTHA`. En 6 mois vous
aurez l'historique de votre montée en compétence. Ça se montre en entretien.

## 4. INSTALLER BERTHA (la moulinette)

Copiez le dossier `bertha/` de la plateforme à la racine de votre dépôt :
```bash
chmod +x bertha/bertha.sh
./bertha/bertha.sh --auto-test     # BERTHA se teste elle-même
```

## 5. EXERCICE 00 — LE PREMIER JOUR (30 XP)

**Rendu :** `rendu/J00/ex00/bonjour.cob`

Écrivez, en respectant la Norme CGBA (lisez-la MAINTENANT : `01_NORME_CGBA.md`,
10 minutes qui vous éviteront 100 heures), un programme qui affiche exactement :

```
$> cobc -x -Wall -o bonjour bonjour.cob
$> ./bonjour
BONJOUR CGBA
JE M APPELLE <VOTRE PRENOM>
```

Piège assumé n°1 : le format fixe. Si `cobc` vous insulte, vérifiez vos colonnes.
Vous venez de gagner votre premier badge : **COLONNE 7**.

## 6. CHECKLIST DE FIN DE JOURNÉE

- [ ] `cobc --version` affiche 3.x
- [ ] La Norme CGBA est lue (et un peu redoutée : c'est normal, c'est sain)
- [ ] `bonjour.cob` compile sans warning et BERTHA dit `[OK]`
- [ ] Le dépôt git existe, premier commit poussé
- [ ] Badge **PREMIÈRE COMPILE** débloqué (+30 XP)

> *Mémo de Marcel, punaisé sur votre écran :*
> *« Demain, les Quatre Divisions. Tout programme COBOL en a quatre, comme les
> saisons. Repose-toi. À partir de demain, on nage. »*
