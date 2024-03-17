import numpy as np
import matplotlib.pyplot as plt

O_reader = open("O_file2.txt")
dist_reader = open("dist_file.txt")

O_lines = O_reader.readlines()
dist_lines = dist_reader.readlines()
Os = np.zeros(len(O_lines))
dists = np.zeros((len(dist_lines), 200))
for t in range(len(O_lines)):
    Os[t] = float(O_lines[t])
    dist_line = dist_lines[t].split(",")
    dists[t, :] = [float(d) for d in dist_line]

plt.plot(Os)
plt.title("O over time")
plt.xlabel("time step")
plt.ylabel("O")
plt.savefig("O_plot.png")
plt.show()

plt.figure(figsize=(7, 3))
ax = plt.subplot(1, 3, 1)
ax.hist(dists[0, :])
ax.set_title("Time step 0")
ax.set_ylabel("frequency")

ax = plt.subplot(1, 3, 2)
ax.hist(dists[50, :])
ax.set_title("Time step 50")
ax.set_xlabel("nearest-neighbour distance")
ax.set_ylabel("frequency")

ax = plt.subplot(1, 3, 3)
ax.hist(dists[299, :])
ax.set_title("Time step 299")
ax.set_ylabel("frequency")

plt.tight_layout()
plt.savefig("dist_hists.png")
plt.show()
