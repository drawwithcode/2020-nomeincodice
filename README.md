# Concept

Shouting Stars is a collaborative real-time game where the players have to control their spaceships by shouting in order to discover new planets together. In these days feeling the people’s presence is increasingly difficult, this game is meant to help teamwork in distant situations: if you can explore space and travel infinite distances with your teammates, helping each other, there is nothing impossible for your crew.
In addition, when people are closed and not separate, playing this game is also useful to break the ice and create a bond between people: screaming together breaks the wall of embarrassment and makes everyone laugh.

(Direi screen della pagina. Iniziale)

It is possible to play Shouting stars by using a mobile device, in this way people are more engaged and it is more simple to play: you can easily see the screen while you are tilting your device to move horizontally and screaming to the microphone to move vertically.



# Visual treatment

To explore using code as a visual tool we chose to develop a flat design look, using simple shapes to represent various elements in space. 
We tried to take inspiration not only from pictures found online, but also from pop culture references.
 (immagine spazio disegnato + immagine futurama) 


We chose Squada One as the main font for the webapp because of its simple yet modern look.

 (almost before we knew it)
 
 (we had left the grond)
 
 (font)

# Design challenges


### Microphone
The whole concept of Shouting Stars revolves around using the microphone as the main user input. We tried to link vertical movement in space to shouting.
We used the user’s voice to power two different kinds of motions: the first is the individual movement of the user’s own spaceship and the second is the general speed of the parallax background. The former determines where the spaceship is positioned on the vertical axis of the screen, while the latter influences the speed of the stars and planets surrounding the player.

### Stars
In order to create an illusion of motion, we decided to split the stars on three separate levels.  We chose to assign to each level different dimensions to simulate depth and different speeds based on the same amplitude of the audio input.

### Planets
Being able to create something virtually endless was an important challenge in our creation process. Therefore rather than drawing single planets to insert in the game as images, we chose to spawn planets with random attributes and colors, generating near to infinite combinations. To further underline this concept of unicity we decided to assign random names to each planet, coded with letters, numbers and symbols.

### Layout
We wanted our webapp to be able to be used by users on a wide variety of mobile devices, ranging from regular phones to tablets. To do so we had to handle both screen and virtual space in a proportional way.


# Design challenges

### Handilg data
The first problem we encountered was the handling of all different data coming from different players. These variables needed to be sent to each player in order to display correctly all elements of the game.
Each player sends an object containing his id, his position, if he has a shield, if the shield it’s blinking and the volume of his microphone. Once we started coding we had spaceships teletransporting in different places and we could not identify the spaceship that had a shield active. 
We came up with the idea of storing all of the client ids in the server and sending those ids to each client. In this way each client could create an object with the id of each player, even the players that were connected before. Once a new piece of data would be received by the client, this could compare the id from the data received to the one stored and identify the correct new position of the player of that id. The same applies for the shield. 

### Calibration
During initial testing we came across a huge problem that we did not anticipate: microphones from different mobile devices behave a lot differently from one to another. We tried to map the volume of the microphones but the problem persisted as the difference was still too great. So we added a button that once pressed would store in a variable the loudest noise that the microphone would capture. This button lasts a few seconds but from the variable that is created from it we were able to map each microphone accordingly to its sensitivity. 

### Discovering planets
We wanted to have a simultaneous discovery of new planets from all players. This way the collaborative effort would be rewarded with a prize at the same time for all discoverers. As there are a lot of different sizes of mobile screens we needed to make a lot of adjustments to have this feature. The position of the planet is decided by the server through a random function that goes from 4000 pixels to 6000. The position of the planet resets when it reaches -2000 pixels from the top of the screen (so approximately more than the biggest screen size of mobile screen in the market). We also had to use a separate variable to calculate the speed of which they move as the sum of all values from the microphone is always a number too big.

### Managing obstacles
The last major coding challenge we had was the display and behaviour of obstacles. It certainly was not the least one as the aim was to show to all players obstacles in the same position (accordingly to each screen) and to make them disappear to all players too, once they hit a spaceship, the bottom of the screen or the shield of a player. About the screen proportions problem we already talked about. So, for the creation of the obstacles we simply have a random function in the server that tells every player where to put the obstacle. For the Y position we calibrated the speed of the obstacles accordingly to the screen.
The other part of the problem was to correctly communicate to every player the exact obstacle to remove. If we had an independent array created in the client for the obstacles we could have the same obstacle at different positions of the array for different players as the moment of logging in the website would be the determining factor. 
To solve this problem we took the X position of the obstacle that would have to be removed (with a tiny bit of range) and we sent it to every player as the X position is created by the server and the same for each player.






