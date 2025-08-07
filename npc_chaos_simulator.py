import pygame
import random

# Constants
WIDTH, HEIGHT = 800, 600
FPS = 60
NPC_COUNT = 10
NPC_SIZE = 10
NPC_SPEED = 100  # pixels per second

# Initialize Pygame
pygame.init()
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("NPC Chaos Simulator - Lite")
clock = pygame.time.Clock()

# Colors
BLACK = (0, 0, 0)
NPC_COLOR = (0, 200, 255)

# NPC Class
class NPC:
    def __init__(self):
        self.pos = pygame.math.Vector2(
            random.randint(0, WIDTH), random.randint(0, HEIGHT)
        )
        self.velocity = pygame.math.Vector2(
            random.uniform(-1, 1), random.uniform(-1, 1)
        ).normalize() * NPC_SPEED

    def move(self, dt):
        self.pos += self.velocity * dt

        # Bounce off the edges
        if self.pos.x <= 0 or self.pos.x >= WIDTH - NPC_SIZE:
            self.velocity.x *= -1
        if self.pos.y <= 0 or self.pos.y >= HEIGHT - NPC_SIZE:
            self.velocity.y *= -1

    def draw(self, surface):
        pygame.draw.rect(surface, NPC_COLOR, (*self.pos, NPC_SIZE, NPC_SIZE))

# Create NPCs
npcs = [NPC() for _ in range(NPC_COUNT)]

# Game loop
running = True
while running:
    dt = clock.tick(FPS) / 1000  # Time since last frame in seconds
    screen.fill(BLACK)

    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False

    for npc in npcs:
        npc.move(dt)
        npc.draw(screen)

    pygame.display.flip()

pygame.quit()
