import { readFile, writeFile } from "fs/promises";
import { EOL } from "os";
import { IWritable } from "./interface";

export class MenuParser {
  private _menuData: string[] = [];

  private constructor(data: string[]) {
    this._menuData = data;
  }

  async write(writer: IWritable) {
    await writer.write(this._menuData.join(EOL));
  }

  static async buildMenu(fileName: string) {
    const data = await readFile(fileName, "utf8");
    return new MenuParser(data.split(EOL));
  }

  get menuData() {
    return this._menuData;
  }
}

class textWriter implements IWritable {
  async write(data: string | Record<string, string[][]>): Promise<void> {
    if (typeof data === "string") {
      await writeFile("menu.txt", data, "utf8");
    } else {
      let menuString = "";
      const sortedCourseNames = Object.keys(data).sort((a, b) =>
        a.localeCompare(b)
      );

      sortedCourseNames.forEach((courseName) => {
        menuString += `* ${courseName} Items *${EOL}`;
        data[courseName].forEach((item: string[]) => {
          const [title, description, price] = item.map((field) => field.trim());
          menuString += `${price}\t${title} - ${description}${EOL}`;
        });
        menuString += EOL;
      });

      await writeFile("menu.txt", menuString.trim(), "utf8");
    }
  }
}

class HtmlWriter implements IWritable {
  async write(data: string | Record<string, string[][]>): Promise<void> {
    if (typeof data === "string") {
      await writeFile("menu.html", data, "utf8");
    } else {
      let htmlContent = this.formatCoursesToHtml(data);
      await writeFile("menu.html", htmlContent, "utf8");
    }
  }

  private formatCoursesToHtml(courses: Record<string, string[][]>): string {
    let htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Menu</title>
</head>
<body>
`;

    const sortedCourseNames = Object.keys(courses).sort((a, b) =>
      a.localeCompare(b)
    );

    sortedCourseNames.forEach((courseName) => {
      htmlContent += `<h2>${courseName} Items</h2>\n<table>\n`;
      courses[courseName].forEach((item: string[]) => {
        const [title, description, price] = item.map((field) => field.trim());
        htmlContent += `<tr><td>${price}</td><td>${title}</td><td>${description}</td></tr>\n`;
      });
      htmlContent += "</table>\n";
    });

    htmlContent += "</body>\n</html>";
    return htmlContent;
  }
}

async function main() {
  try {
    const menu = await MenuParser.buildMenu("menu.csv");
    const items: string[][] = menu.menuData.map((line: string) =>
      line.split(",")
    );
    const courses: Record<string, string[][]> = {};

    items.forEach((item: string[]) => {
      const courseName =
        item[0].trim().charAt(0).toUpperCase() + item[0].trim().slice(1);
      if (!courses[courseName]) {
        courses[courseName] = [];
      }
      courses[courseName].push(item.slice(1));
    });

    const textWriterInstance = new textWriter();
    await textWriterInstance.write(courses);

    const htmlWriterInstance = new HtmlWriter();
    await htmlWriterInstance.write(courses);
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

main();
