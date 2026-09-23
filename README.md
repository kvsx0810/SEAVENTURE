# SEAVENTURE
**Version 2.0** — 21/08/2026

## Description
*SEAVENTURE* is a group webpage built with HTML, CSS and JavaScript, promoting SDG 14: Life Below Water. The landing page carries the shared framing content (SDG overview, target, quote and call to action) and leads into a virtual arcade cabinet, whose curved screen hosts five individually authored generative art pieces, one per team member, browsed as a carousel and launched inside the cabinet screen. Each piece is a separate p5.js sketch exploring its own angle on ocean health.

## Usage Notes
- Open the webpage in a browser to see the landing page and its shared SDG 14 framing content, then press START (or a game link in the footer) to enter the arcade cabinet.
- Inside the cabinet, use the on-screen joystick (left/right) to browse the deck of games, and the center arcade button to open the highlighted game inside the cabinet screen.
- Each game keeps its own controls and rules once opened; see the individual game for details.
- The `games/` folder contains one subfolder per team member, each a self-contained p5.js project:
  - `games/kieu-phuong` — *Mr. Bartholomew Fishington's Ocean Cleanup* (Kiều Phương)
  - `games/tung-phuong` — *Embrace* (Trần Tùng Phương)
  - `games/pham-hoai-an` — *Breath of the Ocean* (Phạm Hoài An)
  - `games/tuan-hung` — *Last Catch* (Trịnh Tuấn Hưng)
  - `games/tieu-dinh-ngoc` — *Coral Reef* (Tiêu Dĩnh Ngọc)

## Installation Instructions
1. Unzip the project folder.
2. Start a local web server in the root directory (e.g. using VS Code's "Live Server" extension, or `python -m http.server`).
3. Open `index.html` in your browser to view the landing page, and follow it into the arcade cabinet (`cabinet/index.html`) to browse and play the games.
4. No external dependencies or plugin installation is required beyond an internet connection to load the p5.js library (loaded via CDN by each game).

## Documentation
- Built with [p5.js](https://p5js.org/), a JavaScript library for creative coding.
- Related reading: [UN Sustainable Development Goal 14: Life Below Water](https://sdgs.un.org/goals/goal14)

## License Information
This project is licensed under the GPL 3.0 license. See the `LICENSE` file for more details.

## Credits
*SEAVENTURE* was created by a five-person team for a COMM2754 group assignment at RMIT University Vietnam:
- Kiều Phương
- Trần Tùng Phương
- Phạm Hoài An
- Trịnh Tuấn Hưng
- Tiêu Dĩnh Ngọc

The shared landing page (`index.html`, `style.css`) and arcade cabinet (`cabinet/`) were built by Trịnh Tuấn Hưng; each subfolder under `games/` is authored and owned by the member named above.

## Contact Information
For questions, feedback, or corrections, please contact:
- **Email:** s4123995@rmit.edu.vn
