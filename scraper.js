const { raw } = require('body-parser');
const { it } = require('node:test');
const puppeteer = require('puppeteer');

async function scrapeData(selectedDate, courseYear) {
    date = new Date(selectedDate);
    const dayOfMonth = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const url = `https://rapla.scng.si/rapla/rapla?page=calendar&user=admin&file=` + courseYear + `IR&day=${dayOfMonth}&month=${month}&year=${year}`;

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    const tdElements = await page.$$("span.tooltip");
    let data = [];
    await Promise.all(
        tdElements.map(async (td) => {
            let text = await page.evaluate((el) => el.textContent, td);
            text = text.replace(/^(.*?)\n/, "");
            text = text.replace(/\n/g, " ");
            text = text.replace("Persons:", "");
            text = text.replace("Persons:", "");
            text = text.replace("Resources:", "");
            text = text.replace("EP", "");
            text = text.replace("Ni opomb", "");
            text = text.replace("Predmet:", "");
            text = text.replace("Reserved by:", "");
            text = text.replace("Opombe:", "");
            text = text.replace("Weekly", " ");
            text = text.replace("Ostalo", " ");
            text = text.replace("Ime dogodka", " ");
            text = text.replace("Predavanja VSŠ", "Predavanje ");
            text = text.replace("Laboratorijske vaje VSŠ", "Vaje ");
            text = text.replace("Lab. za mehatroniko na VSŠ", "");
            text = text.replace(": Jesenske počitnice in prazniki", "Jesenske počitnice in prazniki");
            text = text.replace(": Novoletne počitnice in prazniki", "Novoletne počitnice in prazniki");
            text = text.replace("MEH redni 1. letnik", "");
            text = text.replace("INF redni 1. letnik 2sk,", "");
            text = text.replace("MEH redni 1. letnik,UPK redni 1. letnik,MIC: ", "");
            text = text.replace("UPK redni 1. letnik,", "")
            text = text.replace("INF redni 1. letnik 1sk,INF redni 1. letnik 2sk,,", "")
            text = text.replace(",INF redni 1. letnik 1sk,INF redni 1. letnik 2sk,", "")
            text = text.replace(",INF redni 1. letnik 1sk", "")
            text = text.replace("INF redni 1. letnik 1sk,", "")
            text = text.replace(",INF redni 1. letnik 2sk", "")
            text = text.replace("INF izredni 3. ciklus,INF izredni 1. ciklus,", "")
            text = text.replace(",INF izredni 2. ciklus", "")
            text = text.replace(
                "UPK izredni 3. ciklus 1sk, INF izredni 2. ciklus, INF redni 2. letnik, MEH izredni 2. ciklus, MEH redni 2. letnik 2sk, MEH redni 2. letnik, MEH izredni 1. ciklus, INF redni 1. letnik 1sk, MEH redni 1. letnik 2sk, INF izredni 1. ciklus, INF redni 1. letnik 2sk, UPK izredni 2. ciklus 2sk, UPK redni 1. letnik, INF izredni 3. ciklus, MEH redni 1. letnik, UPK izredni 1. ciklus, UPK redni 2. letnik, MEH izredni 3. ciklus",
                ""
            );
            text = text.replace("Predavalnica", "");
            text = text.replace("Predavalnica:", "");
            text = text.replace("MIC:", "");
            text = text.replace(": VN8", "VN8");
            text = text.replace("Računalnica:", "");
            text = text.replace("   ", "|");
            text = text.replace("         ", "|");
            text = text.replace("    ", "|");
            text = text.replace("   ", "|");
            text = text.replace("  ", "|");
            text = text.replace("|,|", "|");
            text = text.replace("||", "|");
            text = text.replace(",", "");
            text = text.replace("MEH izredni 3. ciklusUPK redni 2. letnik,UPK izredni 1. ciklus,,INF izredni 3. ciklus,UPK izredni 2. ciklus 2sk,INF izredni 1. ciklus,MEH redni 1. letnik 2sk,MEH izredni 1. ciklus,MEH redni 2. letnik,MEH redni 2. letnik 2sk,MEH izredni 2. ciklus,INF redni 2. letnik,INF izredni 2. ciklus,UPK izredni 3. ciklus 1sk ", "");
            text = text.replace("UPK redni 2. letnikMEH izredni 3. ciklus,UPK izredni 1. ciklus,,INF izredni 3. ciklus,UPK izredni 2. ciklus 2sk,INF izredni 1. ciklus,MEH redni 1. letnik 2sk,MEH izredni 1. ciklus,MEH redni 2. letnik,MEH redni 2. letnik 2sk,MEH izredni 2. ciklus,INF redni 2. letnik,INF izredni 2. ciklus,UPK izredni 3. ciklus 1sk ", "");
            text = text.replace("UPK izredni 3. ciklus 1skINF izredni 2. ciklus,INF redni 2. letnik,MEH izredni 2. ciklus,MEH redni 2. letnik 2sk,MEH redni 2. letnik,MEH izredni 1. ciklus, 2sk,INF izredni 1. ciklus,UPK izredni 2. ciklus 2sk,INF izredni 3. ciklus,MEH redni 1. letnik,UPK izredni 1. ciklus,UPK redni 2. letnik,MEH izredni 3. ciklus ", "");
            text = text.replace("INF redni 2. letnik", "")
            text = text.replace("MEH redni 2. letnik,", "")
            text = text.replace("Predavanja/vaje VSŠ  ", "Predavanja/vaje|")
            text = text.replace("MEH izredni 2. ciklusMEH redni 2. letnik 2sk,MEH izredni 1. ciklus,INF izredni 1. ciklus, 2sk,UPK izredni 2. ciklus 2sk,INF izredni 3. ciklus,MEH redni 1. letnik, 2sk,UPK izredni 1. ciklus,UPK redni 2. letnik,MEH izredni 3. ciklus,INF redni 2. letnik,INF izredni 2. ciklus,UPK izredni 3. ciklus 1sk", "")
            text = text.replace("MEH izredni 3. ciklusUPK redni 2. letnik,UPK izredni 1. ciklus,,INF izredni 3. ciklus,UPK izredni 2. ciklus 2sk,MEH redni 1. letnik 2sk,MEH redni 2. letnik 2sk,,INF izredni 2. ciklus ", "")
            text = text.replace(": Prvomajske počitnice", "Prvomajske počitnice")
            text = text.replace(": Prost dan", "Prost dan")
            text = text.replace("Izpit VSŠ", "|Izpit VSŠ")
            text = text.replace("Praktično izobraževanje", "|Praktično izobraževanje")
            text = text.replace("   ", "|");
            text = text.replace("||", "|");
            text = text.replace("INF izredni 3. ciklus, 2sk,UPK redni 2. letnik,MEH izredni 3. ciklus,INF izredni 1. ciklus,MEH redni 1. letnik 2sk,MEH izredni 1. ciklus,MEH redni 2. letnik 2sk,MEH izredni 2. ciklus,INF redni 2. letnik ", "")
            text = text.replace(": Velikonočni ponedeljek", "Velikonočni ponedeljek")
            text = text.replace("UPK izredni 3. ciklus 1sk,MEH izredni 2. ciklus,MEH redni 2. letnik 2sk,MEH izredni 1. ciklus, 2sk,INF izredni 1. ciklus,UPK izredni 2. ciklus 2sk,INF izredni 3. ciklus,MEH redni 1. letnik,UPK izredni 1. ciklus,UPK redni 2. letnik,MEH izredni 3. ciklus ", "")
            text = text.replace("MEH redni 2. letnik 2sk,INF redni 2. letnik 2sk,MEH redni 2. letnik ", "")
            text = text.replace("|Praktično izobraževanje|Praktično izobraževanje|", "|Praktično izobraževanje")
            text = text.replace("UPK redni 2. letnikMEH izredni 3. ciklus,UPK izredni 1. ciklus,,INF izredni 3. ciklus,UPK izredni 2. ciklus 2sk,INF izredni 1. ciklus,MEH redni 1. letnik 2sk,MEH izredni 1. ciklus,MEH redni 2. letnik 2sk,MEH izredni 2. ciklus,,UPK izredni 3. ciklus 1sk ", "");
            text = text.replace("MEH izredni 3. ciklusUPK redni 2. letnik,UPK izredni 1. ciklus,,INF izredni 3. ciklus,UPK izredni 2. ciklus 2sk,INF izredni 1. ciklus,MEH redni 1. letnik 2sk,MEH izredni 1. ciklus,MEH redni 2. letnik 2sk,MEH izredni 2. ciklus,,UPK izredni 3. ciklus 1sk ", "")
            data.push(text);
        })
    );

    // Initialize groups
    const groupOne = {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: []
    };

    const groupTwo = {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: []
    };

    if (courseYear == 1) {
        for (i = 0; i < data.length / 2; i++) {
            const day1 = data[i].split(" ")[0];
            const day2 = data[i].split(" ")[3];
            if (day1 == "Mon" && day2 == "Fri") {
                groupOne.monday.push(data[i]);
                groupOne.tuesday.push(data[i]);
                groupOne.wednesday.push(data[i]);
                groupOne.thursday.push(data[i]);
                groupOne.friday.push(data[i]);
            } else {
                const day = data[i].split(" ")[0];
                if (day == "Mon") {
                    groupOne.monday.push(data[i]);
                }
                else if (day == "Tue") {
                    groupOne.tuesday.push(data[i]);
                }
                else if (day == "Wed") {
                    groupOne.wednesday.push(data[i]);
                }
                else if (day == "Thu") {
                    groupOne.thursday.push(data[i]);
                }
                else if (day == "Fri") {
                    groupOne.friday.push(data[i]);
                }
            }

        }
        for (i = data.length / 2; i < data.length; i++) {
            const day1 = data[i].split(" ")[0];
            const day2 = data[i].split(" ")[3];
            if (day1 == "Mon" && day2 == "Fri") {
                groupTwo.monday.push(data[i]);
                groupTwo.tuesday.push(data[i]);
                groupTwo.wednesday.push(data[i]);
                groupTwo.thursday.push(data[i]);
                groupTwo.friday.push(data[i]);
            } else {
                const day = data[i].split(" ")[0];
                if (day == "Mon") {
                    groupTwo.monday.push(data[i]);
                }
                else if (day == "Tue") {
                    groupTwo.tuesday.push(data[i]);
                }
                else if (day == "Wed") {
                    groupTwo.wednesday.push(data[i]);
                }
                else if (day == "Thu") {
                    groupTwo.thursday.push(data[i]);
                }
                else if (day == "Fri") {
                    groupTwo.friday.push(data[i]);
                }
            }
        }
    }else if (courseYear == 2){
        for (i = 0; i < data.length; i++) {
            const day1 = data[i].split(" ")[0];
            const day2 = data[i].split(" ")[3];
            if (day1 == "Mon" && day2 == "Fri" || day2 == "Thu") {
                groupOne.monday.push(data[i]);
                groupOne.tuesday.push(data[i]);
                groupOne.wednesday.push(data[i]);
                groupOne.thursday.push(data[i]);
                groupOne.friday.push(data[i]);
            } else {
                const day = data[i].split(" ")[0];
                if (day == "Mon") {
                    groupOne.monday.push(data[i]);
                }
                else if (day == "Tue") {
                    groupOne.tuesday.push(data[i]);
                }
                else if (day == "Wed") {
                    groupOne.wednesday.push(data[i]);
                }
                else if (day == "Thu") {
                    groupOne.thursday.push(data[i]);
                }
                else if (day == "Fri") {
                    groupOne.friday.push(data[i]);
                }
            }

        }
    }



    // Output
    // console.log('groupOne:', groupOne);
    // console.log('groupTwo:', groupTwo);
    browser.close();
    return { groupOne, groupTwo };
}

module.exports = {
    scrapeData
};