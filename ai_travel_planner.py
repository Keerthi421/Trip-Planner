import streamlit as st
from agno.agent import Agent
from agno.models.openai import OpenAIChat
from agno.team import Team
from agno.tools.duckduckgo import DuckDuckGoTools
import os

# ── Page config ────────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="AI Travel Planner",
    page_icon="✈️",
    layout="wide",
)

st.title("✈️ AI Travel Planner Agent Team")
st.markdown(
    "Plan your perfect trip with a team of specialized AI travel agents powered by GPT-4o."
)

# ── Sidebar ─────────────────────────────────────────────────────────────────────
with st.sidebar:
    st.header("🔑 API Configuration")
    openai_api_key = st.text_input(
        "OpenAI API Key",
        type="password",
        placeholder="sk-...",
        help="Required to run the AI agents",
    )
    st.divider()
    st.markdown(
        """
        **Agent Team:**
        - 🔍 Web Search Agent
        - ✈️ Flight Search Agent
        - 🏨 Hotel Search Agent
        - 🗺️ Itinerary Planner Agent
        """
    )
    st.divider()
    st.caption("Built with [Agno](https://docs.agno.com) + Streamlit")

# ── Travel inputs ───────────────────────────────────────────────────────────────
st.subheader("📋 Trip Details")

col1, col2 = st.columns(2)
with col1:
    source = st.text_input("🛫 Departure City", placeholder="e.g. New York")
    start_date = st.date_input("📅 Departure Date")
with col2:
    destination = st.text_input("🛬 Destination City", placeholder="e.g. Paris")
    end_date = st.date_input("📅 Return Date")

col3, col4 = st.columns(2)
with col3:
    num_travelers = st.number_input("👥 Number of Travelers", min_value=1, max_value=20, value=2)
with col4:
    budget = st.selectbox(
        "💰 Budget Level",
        ["Budget (< $100/night)", "Mid-range ($100–$300/night)", "Luxury (> $300/night)"],
    )

preferences = st.text_area(
    "🎯 Travel Preferences",
    placeholder="e.g. I love local food, outdoor adventures, and off-the-beaten-path experiences. I prefer boutique hotels over chains.",
    height=100,
)

# ── Run ─────────────────────────────────────────────────────────────────────────
if st.button("🚀 Plan My Trip!", use_container_width=True, type="primary"):
    if not openai_api_key:
        st.error("Please enter your OpenAI API key in the sidebar.")
        st.stop()

    if not source or not destination:
        st.error("Please fill in both departure city and destination.")
        st.stop()

    if end_date <= start_date:
        st.error("Return date must be after departure date.")
        st.stop()

    os.environ["OPENAI_API_KEY"] = openai_api_key

    # ── Define Agents ────────────────────────────────────────────────────────────
    web_agent = Agent(
        name="Web Search Agent",
        role="Search the web for travel destination information",
        model=OpenAIChat(id="gpt-4o"),
        tools=[DuckDuckGoTools()],
        instructions=[
            "Search for up-to-date information about the travel destination.",
            "Find visa requirements, entry restrictions, health advisories, and safety tips.",
            "Research the best time to visit, local culture, customs, and language tips.",
            "Always cite your sources.",
        ],
        show_tool_calls=True,
        markdown=True,
    )

    flight_agent = Agent(
        name="Flight Search Agent",
        role="Find the best flight options for the trip",
        model=OpenAIChat(id="gpt-4o"),
        tools=[DuckDuckGoTools()],
        instructions=[
            "Search for flight options between the origin and destination cities.",
            "Provide information on airlines, estimated prices, flight durations, and layovers.",
            "Suggest both direct and connecting flights where relevant.",
            "Consider budget level when recommending flights.",
            "Mention popular booking platforms (Google Flights, Skyscanner, Kayak).",
        ],
        show_tool_calls=True,
        markdown=True,
    )

    hotel_agent = Agent(
        name="Hotel Search Agent",
        role="Find the best accommodation options",
        model=OpenAIChat(id="gpt-4o"),
        tools=[DuckDuckGoTools()],
        instructions=[
            "Search for hotels, hostels, or vacation rentals in the destination.",
            "Filter recommendations to match the traveler's budget level.",
            "Include hotel name, location, price range, star rating, and key amenities.",
            "Consider proximity to major attractions and transport links.",
            "Mention popular booking platforms (Booking.com, Hotels.com, Airbnb).",
        ],
        show_tool_calls=True,
        markdown=True,
    )

    itinerary_agent = Agent(
        name="Itinerary Planner Agent",
        role="Create a detailed day-by-day travel itinerary",
        model=OpenAIChat(id="gpt-4o"),
        tools=[DuckDuckGoTools()],
        instructions=[
            "Create a practical, day-by-day itinerary for the full trip duration.",
            "Include top attractions, local restaurants, cultural experiences, and hidden gems.",
            "Consider realistic travel times between locations.",
            "Balance popular tourist spots with authentic local experiences.",
            "Align activities with the traveler's stated preferences and budget.",
            "Include estimated costs per activity where possible.",
        ],
        show_tool_calls=True,
        markdown=True,
    )

    # ── Define Team ──────────────────────────────────────────────────────────────
    travel_team = Team(
        name="AI Travel Planner Team",
        mode="coordinate",
        model=OpenAIChat(id="gpt-4o"),
        members=[web_agent, flight_agent, hotel_agent, itinerary_agent],
        instructions=[
            "You are a world-class travel planning team. Work together to create a comprehensive, personalized travel plan.",
            "Step 1 — Web Search Agent: Research the destination (visa, safety, culture, best time to visit).",
            "Step 2 — Flight Search Agent: Find flight options within budget.",
            "Step 3 — Hotel Search Agent: Find accommodation within budget near key attractions.",
            "Step 4 — Itinerary Planner Agent: Create a detailed day-by-day itinerary.",
            "Finally, compile everything into a well-structured travel plan with sections for: "
            "Destination Overview, Travel Requirements, Flights, Accommodation, Day-by-Day Itinerary, and Budget Summary.",
            "Always present information in clean markdown with clear headings.",
        ],
        show_tool_calls=True,
        markdown=True,
    )

    # ── Build query ──────────────────────────────────────────────────────────────
    num_days = (end_date - start_date).days
    query = f"""
    Plan a complete trip with the following details:

    - **From:** {source}
    - **To:** {destination}
    - **Departure:** {start_date.strftime("%B %d, %Y")}
    - **Return:** {end_date.strftime("%B %d, %Y")} ({num_days} nights)
    - **Travelers:** {num_travelers} person(s)
    - **Budget:** {budget}
    - **Preferences:** {preferences if preferences else "No specific preferences"}

    Please provide a complete travel plan including:
    1. Destination overview & travel requirements (visa, health, safety)
    2. Recommended flight options with estimated prices
    3. Accommodation recommendations that fit the budget
    4. A detailed day-by-day itinerary for all {num_days} days
    5. Estimated total budget breakdown
    """

    # ── Display results ──────────────────────────────────────────────────────────
    with st.spinner("🤖 Your AI travel team is planning your trip..."):
        try:
            response = travel_team.run(query)
            st.success("✅ Your travel plan is ready!")
            st.divider()
            st.markdown(response.content)
        except Exception as e:
            st.error(f"An error occurred: {str(e)}")
            st.info("Please check your API key and try again.")
