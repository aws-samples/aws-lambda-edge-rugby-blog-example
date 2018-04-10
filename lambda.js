var rugbyDataFromFile = require('./rugby_data.json');

var data = calculateTables(rugbyDataFromFile);

console.log(JSON.stringify(data, null, 2));

function calculateTables(rugbyData) {
    var data = {};
    data.name = rugbyData.name;
    data.tables = [];
    for(i = 0; i < rugbyData.leagues.length; i++) {
        var leagueData = {
            name: rugbyData.leagues[i].name,
            teams: rugbyData.leagues[i].teams,
            table: []
        }
        // show wins, losses, draws, bonus points, points difference and (league) points
        tableData = {};
        // empty table initially
        for(t = 0; t < rugbyData.leagues[i].teams.length; t++) {
            // W,D,L,BP,PD,P
            tableData[rugbyData.leagues[i].teams[t]] = [0,0,0,0,0,0,0,rugbyData.leagues[i].teams[t]];
        }
        for(w = 0; w < rugbyData.leagues[i].weeks.length; w++) {
            week = rugbyData.leagues[i].weeks[w];
            for(g = 0; g < week.length; g++) {
                game = week[g].split(',');
                if(game[0] == '1') {
                    // process the game as part of the table
                    home_score = 5*parseInt(game[2]) + 2*parseInt(game[3]) + 3*(parseInt(game[4]) + parseInt(game[5]));
                    away_score = 5*parseInt(game[7]) + 2*parseInt(game[8]) + 3*(parseInt(game[9]) + parseInt(game[10]));
                    home_points = 0;
                    away_points = 0;
                    home_win = false;
                    away_win = false;
                    draw = false;
                    if(home_score > away_score) {
                        home_points = 4;
                        home_win = true;
                    } else if(away_score > home_score) {
                        away_points = 4;
                        away_win = true;
                    } else if(away_score == home_score) {
                        home_points = 2;
                        away_points = 2;
                        draw = true;
                    }
                    home_bp = false;
                    away_bp = false;
                    // did the home team score 4 or more tries?
                    if(parseInt(game[2]) >= 4) {
                        home_points++;
                        home_bp = true;
                    }
                    // did the away team score 4 or more tries?
                    if(parseInt(game[7]) >= 4) {
                        away_points++;
                        away_bp = true;
                    }


                    // now update the table as a single process rather than before
                    home_team = tableData[game[1]];
                    away_team = tableData[game[6]];
                    // add a played game to each team
                    home_team[0]++;
                    away_team[0]++;
                    if(home_win) {
                        home_team[1]++;
                        away_team[3]++;
                        points_difference = home_score - away_score;
                        home_team[5] = home_team[5] + points_difference;
                        away_team[5] = away_team[5] - points_difference;
                    }
                    if(away_win) {
                        home_team[3]++;
                        away_team[1]++;
                        points_difference = away_score - home_score;
                        home_team[5] = home_team[5] + points_difference;
                        away_team[5] = away_team[5] - points_difference;
                    }
                    if(draw) {
                        home_team[2]++;
                        away_team[2]++;
                    }
                    if(home_bp) {
                        home_team[4]++;
                    }
                    if(away_bp) {
                        away_team[4]++;
                    }
                    home_team[6] = home_team[6] + home_points;
                    away_team[6] = away_team[6] + away_points;

                }
            }
        }

        // sort the table by league points, then wins, then points difference
        // get each row of the table, into an array
        // sort the array by league points
        var table = [];
        for(t = 0; t < rugbyData.leagues[i].teams.length; t++) {
            team = rugbyData.leagues[i].teams[t];
            table.push(tableData[team]);
        }   
        table = table.sort(tableComparator).reverse();

        leagueData.table = table;
        data.tables.push(leagueData);

    }
    return data;
}

function tableComparator(a,b) {
    if (a[6] < b[6]) return -1;
    if (a[6] > b[6]) return 1;
    // if we get here, then points are the same so use wins
    if (a[1] < b[1]) return -1;
    if (a[1] > b[1]) return 1;
    // if we get here, then wins are the same so use points difference
    if (a[5] < b[5]) return -1;
    if (a[5] > b[5]) return 1; 
    // if we get here use bonus points (as an analog for tries scored?
    if (a[4] < b[4]) return -1;
    if (a[4] > b[4]) return 1; 
    //  use alphabetical order
    if (a[7] < b[7]) return -1;
    if (a[7] > b[7]) return 1; 
    return 0;
}

