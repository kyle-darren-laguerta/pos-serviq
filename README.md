#### Step by step preocedure in running the program:
1. Download the `serviq_init.sql` file I sent in the GC
2. Run the XAMPP as administrator and import the `serviq_init.sql` there
3. Clone this repository using `git clone https://github.com/kyle-darren-laguerta/pos-serviq.git`
4. Open the repo in VSCode or any IDE, go to the `backend` folder and create a folder named `bin`
5. Put the `serviq_init.sql` inside the bin folder
6. Copy the path of the `backend` folder, open a new terminal and type `cd [copied path]`
7. In the same terminal, type `npm install`, after that type `npm start`
8. Go back to VSCode and copy the path of the `frontend` folder, open a new terminal and type `cd [copied path]`
9. In the same terminal, type `npm install`, after that type `npm run dev`
10. `Ctrl + Click` the link that will show to your terminal