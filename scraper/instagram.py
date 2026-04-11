import argparse
import json
import os
import instaloader
from config import HASHTAGS, DATA_DIR, LEADS_BRUTOS_PATH


def coletar_por_hashtag(hashtag: str, limit: int) -> list[dict]:
    """Coleta perfis de lojas a partir de posts de uma hashtag."""
    loader = instaloader.Instaloader()
    leads = []
    seen = set()

    print(f"Buscando posts com #{hashtag}...")
    posts = instaloader.Hashtag.from_name(loader.context, hashtag).get_posts()

    count = 0
    for post in posts:
        if count >= limit:
            break

        profile = post.owner_profile
        username = profile.username

        if username in seen:
            continue
        seen.add(username)

        # Filtra: so perfis que parecem ser lojas (tem site na bio)
        site = profile.external_url
        if not site:
            continue

        lead = {
            "instagram": username,
            "nome_loja": profile.full_name,
            "site": site,
            "seguidores": profile.followers,
        }
        leads.append(lead)
        count += 1
        print(f"  [{count}/{limit}] @{username} — {site} ({profile.followers} seguidores)")

    return leads


def main():
    parser = argparse.ArgumentParser(description="Coleta perfis de lojas de oculos no Instagram")
    parser.add_argument("--hashtag", type=str, default=None, help="Hashtag especifica para buscar")
    parser.add_argument("--limit", type=int, default=50, help="Limite de perfis por hashtag")
    args = parser.parse_args()

    hashtags = [args.hashtag] if args.hashtag else HASHTAGS
    all_leads = []
    seen_usernames = set()

    for tag in hashtags:
        leads = coletar_por_hashtag(tag, args.limit)
        for lead in leads:
            if lead["instagram"] not in seen_usernames:
                seen_usernames.add(lead["instagram"])
                all_leads.append(lead)

    os.makedirs(DATA_DIR, exist_ok=True)
    with open(LEADS_BRUTOS_PATH, "w", encoding="utf-8") as f:
        json.dump(all_leads, f, ensure_ascii=False, indent=2)

    print(f"\n{len(all_leads)} leads brutos salvos em {LEADS_BRUTOS_PATH}")


if __name__ == "__main__":
    main()
