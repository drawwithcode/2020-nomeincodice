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





