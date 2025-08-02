package com.watchtogether.roomservice.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum RoomCategory {
    MOVIES("🎬 Movies", "Watching movies of all genres"),
    SERIES("📺 TV Shows", "Binge-watching series together"),
    ANIME("🇯🇵 Anime", "Anime, manga and Asian animation"),
    MUSIC("🎵 Music", "Music videos, concerts, playlists"),
    GAMING("🎮 Gaming", "Game streams, esports tournaments"),
    EDUCATION("🎓 Education", "Lectures, documentaries, courses"),
    SPORTS("⚽ Sports", "Live sports events and broadcasts"),
    STAND_UP("😂 Stand-Up", "Comedy performances and shows"),
    KIDS("👶 Kids", "Family-friendly content for children"),
    ART("🎨 Art", "Art films, indie cinema, arthouse"),
    TRAVEL("✈️ Travel", "Travel documentaries and cultures"),
    COOKING("🍳 Cooking", "Culinary shows and masterclasses"),
    FASHION("👗 Fashion", "Fashion shows and industry content"),
    LIVE("🔴 LIVE", "Live broadcasts and streams"),
    TESTING("🧪 Testing", "Feature testing and experiments"),
    SOCIAL("💬 Social", "Casual hangouts and discussions"),
    OTHER("❔ Other", "Miscellaneous content and themes"),
    NONE("?", "No category yet");

    private final String displayName;
    private final String description;
}
