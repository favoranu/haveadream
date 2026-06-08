"""Generate had-tokenomics.png for the $HAD landing page.
Requires: pip install matplotlib
Run: python scripts/generate-tokenomics.py
"""
import matplotlib.pyplot as plt

labels = ['Team & Founder', 'Treasury', 'Airdrop', 'Ecosystem Incentives']
sizes = [19, 39.51, 22.2, 19.29]
colors = ['#FFD700', '#00BFFF', '#FF69B4', '#32CD32']

fig, ax = plt.subplots(figsize=(8, 8))
ax.pie(
    sizes,
    labels=labels,
    autopct='%1.2f%%',
    startangle=90,
    colors=colors,
    textprops={'color': 'white', 'fontsize': 12},
)
ax.set_title('$HAD Token Allocation (10B Total Supply)', color='white', fontsize=16)
fig.patch.set_facecolor('#0f0c29')
ax.set_facecolor('#0f0c29')

out = 'public/images/had-tokenomics.png'
plt.savefig(out, dpi=300, bbox_inches='tight', facecolor=fig.get_facecolor())
print(f'Saved {out}')